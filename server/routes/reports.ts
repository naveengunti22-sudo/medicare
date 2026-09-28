import { Router, Response } from 'express';
import { db, MedicalReport } from '../db.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Upload report
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      reportType = 'LAB_REPORT',
      fileName,
      fileType = 'pdf',
      fileSizeKb = 500,
      fileData,
      authorizedDoctorIds = [],
      authorizedAllDoctors = false,
      notes = '',
    } = req.body;

    if (!title || !fileName) {
      return res.status(400).json({ error: 'Title and file name are required.' });
    }

    let patientId = req.user!.patientId;
    if (!patientId && req.user!.role === 'PATIENT') {
      patientId = db.findPatientByUserId(req.user!.userId)?.id;
    }

    if (!patientId) {
      patientId = db.patients[0]?.id;
    }

    if (!patientId) {
      return res.status(400).json({ error: 'Valid patient profile is required.' });
    }

    const reportId = `rep-${Date.now()}`;
    const newReport: MedicalReport = {
      id: reportId,
      patientId,
      title,
      reportType,
      fileName,
      fileType,
      fileSizeKb: Number(fileSizeKb),
      fileData: fileData || '',
      uploadedAt: new Date().toISOString(),
      authorizedDoctorIds: Array.isArray(authorizedDoctorIds) ? authorizedDoctorIds : [],
      authorizedAllDoctors: Boolean(authorizedAllDoctors),
      notes,
    };

    db.medicalReports.unshift(newReport);

    db.addAuditLog(req.user!.userId, 'UPLOAD_MEDICAL_REPORT', 'MEDICAL_REPORT', reportId, {
      title,
      reportType,
    });

    return res.status(201).json({
      success: true,
      report: newReport,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List reports
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user!.role;
    let list: MedicalReport[] = [];

    if (role === 'PATIENT') {
      const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
      list = db.medicalReports.filter((r) => r.patientId === patientId);
    } else if (role === 'DOCTOR') {
      const doctorId = req.user!.doctorId || db.findDoctorByUserId(req.user!.userId)?.id;
      const targetPatientId = req.query.patientId as string;

      // Doctor only sees reports granted by the patient
      list = db.medicalReports.filter(
        (r) =>
          (!targetPatientId || r.patientId === targetPatientId) &&
          (r.authorizedAllDoctors || (doctorId && r.authorizedDoctorIds.includes(doctorId)))
      );
    } else {
      list = db.medicalReports;
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Patient manages consent (grant or revoke access for doctors)
router.put('/:id/consent', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId, grant, authorizeAll } = req.body;
    const report = db.medicalReports.find((r) => r.id === req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
    if (report.patientId !== patientId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to alter permissions for this medical report.' });
    }

    if (authorizeAll !== undefined) {
      report.authorizedAllDoctors = Boolean(authorizeAll);
    }

    if (doctorId) {
      if (grant) {
        if (!report.authorizedDoctorIds.includes(doctorId)) {
          report.authorizedDoctorIds.push(doctorId);
        }
      } else {
        report.authorizedDoctorIds = report.authorizedDoctorIds.filter((id) => id !== doctorId);
      }
    }

    db.addAuditLog(req.user!.userId, 'UPDATE_REPORT_CONSENT', 'MEDICAL_REPORT', report.id, {
      doctorId,
      grant,
      authorizedAll: report.authorizedAllDoctors,
    });

    return res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete report
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const idx = db.medicalReports.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const patientId = req.user!.patientId || db.findPatientByUserId(req.user!.userId)?.id;
    if (db.medicalReports[idx].patientId !== patientId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this medical report.' });
    }

    db.medicalReports.splice(idx, 1);
    db.addAuditLog(req.user!.userId, 'DELETE_MEDICAL_REPORT', 'MEDICAL_REPORT', req.params.id);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
