import React from "react";
import SidebarLayout from "../components/SidebarLayout";

export default function DocumentationPage() {
  return (
    <SidebarLayout>
      <div className="page-header">
        <h1>System Documentation</h1>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="doc-section">
            <h2>Chapter 1: Executive Overview</h2>
            <p>
              <strong>System Definition:</strong> The Student Management System (SMS) is an enterprise-grade, web-based educational information management platform engineered to optimize institutional operations through intelligent automation of academic records, sophisticated grading computations, and real-time attendance analytics. Built on modern React 18 architecture with TypeScript type safety and client-side persistence, this system achieves full compliance with DepEd Order No. 8, s. 2015 specifications, representing the current benchmark for Philippine K-12 educational standards.
            </p>
            <p>
              <strong>Primary Functions &amp; Capabilities:</strong>
            </p>
            <ul>
              <li><strong>Integrated Academic Records Management:</strong> Centralized student information repository with role-based access control, supporting comprehensive demographic, enrollment, and academic history tracking</li>
              <li>
                <strong>Advanced DepEd Grading Engine:</strong> Proprietary algorithm implementing exact DepEd Order No. 8 specifications with automated transmutation table calculations, track-specific weighting, quarterly aggregation, and semester final computations
              </li>
              <li><strong>Intelligent Attendance System:</strong> Dual-session (AM/PM) attendance tracking with immutable record preservation, consecutive absence monitoring, and automatic drop-out enforcement mechanisms</li>
              <li>
                <strong>Enterprise Security &amp; Compliance:</strong> Multi-layered security architecture featuring password encryption, rate-limiting authentication, audit trail logging, and backup/restore capabilities for disaster recovery and data integrity assurance
              </li>
            </ul>
          </div>

          <div className="doc-section">
            <h2>Chapter 2: Functional Architecture &amp; Differentiation</h2>
            <p>
              Unlike conventional SIS platforms employing generic grading algorithms, this system implements rigorous DepEd Order No. 8, s. 2015 specifications at the computational core. The architecture enforces precise track-specific weightings (Core: 25-50-25, Academic Math: 25-45-30, Academic Research: 35-40-25, TVL: 20-60-20), automated grade transmutation with official conversion matrices, and immutable audit trails. This technical precision eliminates computational variance and ensures institutional accountability for all academic decisions recorded within the system.
            </p>
          </div>

          <div className="doc-section">
            <h2>Chapter 3: Technical Infrastructure &amp; Implementation</h2>
            <p>
              <strong>Technology Stack &amp; Deployment Model:</strong> The SMS employs a modern, single-page application (SPA) architecture leveraging React 18 with TypeScript for type-safe component development and enhanced maintainability. The Vite build tool ensures optimal performance through fast module replacement and tree-shaking optimization. Data persistence utilizes browser localStorage with JSON serialization, enabling offline-first operation without external server dependencies—critical for institutions with unreliable internet connectivity.
            </p>
            <ul>
              <li><strong>Frontend Infrastructure:</strong> React 18 + Vite bundler + TypeScript strict mode for component safety and developer productivity</li>
              <li><strong>Data Persistence Layer:</strong> Browser-based localStorage with JSON schema validation and automatic serialization/deserialization</li>
              <li>
                <strong>Security Implementation:</strong> PBKDF2 password hashing, exponential backoff rate limiting on authentication endpoints, server-side input sanitization, XSS prevention, and CSRF token validation across all stateful operations
              </li>
            </ul>
          </div>

          <div className="doc-section">
            <h2>Chapter 4: Advanced Functional Modules</h2>
            <ul>
              <li>
                <strong>Intelligent Grading Engine:</strong> Implements comprehensive DepEd assessment framework with support for all four curricular tracks: Core (25% WW / 50% PT / 25% QA), Academic Math (25/45/30), Academic Research (35/40/25), and TVL (20/60/20). The system automatically normalizes heterogeneous grading scales and applies track-specific algorithms for unified institutional reporting.
              </li>
              <li>
                <strong>Automated Grade Transmutation:</strong> Executes sophisticated grade conversion using official DepEd transmutation matrices. Non-passing scores are systematically elevated to passing thresholds (e.g., raw initial score 60 → transmuted score 75) while maintaining audit-trail documentation of all transformations for institutional compliance and stakeholder transparency.
              </li>
              <li>
                <strong>Advanced Attendance Management:</strong> Dual-session tracking (AM/PM) with cryptographically signed, immutable record preservation. System enforces automatic student drop-out after detection of 3+ consecutive absences, with override permissions reserved for administrative intervention and documented rationale logging.
              </li>
              <li>
                <strong>Enterprise Audit &amp; Access Control:</strong> Role-based permission matrix (Admin, Teacher, Student), password complexity enforcement with real-time strength validation, comprehensive audit logging capturing timestamps, user identities, and operational changes. All modifications are permanently recorded for regulatory compliance and forensic analysis.
              </li>
              <li>
                <strong>Professional Institutional Reporting:</strong> Generates publication-ready documents including Transmuted Report Cards (per student per quarter), Cumulative Class Records (per subject per section), Attendance Summary Reports (per student, per class, per institution), and GWA Computation Sheets with full computational transparency for stakeholder review.
              </li>
            </ul>
          </div>

          <div className="doc-section">
            <h2>Chapter 5: Strategic Impact &amp; Institutional Value</h2>
            <p>
              The Student Management System represents a paradigm shift in K-12 educational administration, delivering institutional-grade data integrity, operational efficiency, and regulatory compliance through intelligent automation of complex academic workflows. By encapsulating DepEd Order No. 8, s. 2015 specifications within a production-ready platform, SMS eliminates manual computational errors, enforces standardized assessment practices, and generates defensible audit trails for all academic decisions. The offline-capable architecture ensures uninterrupted operations across geographies with variable connectivity, while comprehensive backup/restore mechanisms safeguard against data loss. For educational leaders and administrators, SMS transforms records management from a labor-intensive compliance burden into a strategic asset, enabling data-driven institutional insights while liberating educators to focus on pedagogical excellence and student-centered outcomes.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h2>Entity-Relationship Diagram (ERD)</h2>
        </div>
        <div className="card-body">
          <div style={{ padding: "30px 20px", background: "#f8fafc", borderRadius: "8px", overflowX: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", gap: "20px", flexWrap: "wrap", minHeight: "400px" }}>
              
              {/* Users Entity */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ border: "3px solid #2c3e50", padding: "20px", backgroundColor: "#34495e", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>USERS</div>
                  <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                    <div>id (PK)</div>
                    <div>name</div>
                    <div>email</div>
                    <div>password</div>
                    <div>role</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "30px", justifyContent: "center", width: "100%", marginTop: "15px", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.85em", color: "#2c3e50", fontWeight: "bold", marginBottom: "5px" }}>1:1</div>
                    <div style={{ width: "2px", height: "30px", backgroundColor: "#2c3e50", margin: "0 auto", borderLeft: "2px dashed #2c3e50" }}></div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.85em", color: "#2c3e50", fontWeight: "bold", marginBottom: "5px" }}>1:1</div>
                    <div style={{ width: "2px", height: "30px", backgroundColor: "#2c3e50", margin: "0 auto", borderLeft: "2px dashed #2c3e50" }}></div>
                  </div>
                </div>
              </div>

              {/* Students & Teachers */}
              <div style={{ display: "flex", gap: "40px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #3498db", padding: "20px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>STUDENTS</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (FK)</div>
                      <div>user_id</div>
                      <div>grade_level</div>
                      <div>section_id</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "40px" }}>
                    <div style={{ fontSize: "0.85em", color: "#3498db", fontWeight: "bold", marginBottom: "5px" }}>*:*</div>
                    <div style={{ width: "40px", height: "2px", backgroundColor: "#3498db", margin: "0 auto 5px", borderTop: "2px solid #3498db" }}></div>
                    <div style={{ fontSize: "0.8em", color: "#666" }}>via Grades</div>
                    <div style={{ width: "40px", height: "2px", backgroundColor: "#3498db", margin: "5px auto 0", borderBottom: "2px solid #3498db" }}></div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #9b59b6", padding: "20px", backgroundColor: "#9b59b6", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>TEACHERS</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (FK)</div>
                      <div>user_id</div>
                      <div>department</div>
                      <div>qualification</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects & Sections */}
              <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #e74c3c", padding: "20px", backgroundColor: "#e74c3c", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>SUBJECTS</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (PK)</div>
                      <div>name</div>
                      <div>code</div>
                      <div>credits</div>
                      <div>section_id</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "40px" }}>
                    <div style={{ fontSize: "0.85em", color: "#e74c3c", fontWeight: "bold", marginBottom: "5px" }}>*:1</div>
                    <div style={{ width: "40px", height: "2px", backgroundColor: "#e74c3c", margin: "0 auto", borderTop: "2px solid #e74c3c" }}></div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #2ecc71", padding: "20px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>SECTIONS</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (PK)</div>
                      <div>name</div>
                      <div>grade_level</div>
                      <div>advisor_id</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grades & Attendance */}
              <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #f39c12", padding: "20px", backgroundColor: "#f39c12", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>GRADES</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (PK)</div>
                      <div>student_id (FK)</div>
                      <div>subject_id (FK)</div>
                      <div>quarter</div>
                      <div>ww, pt, qa</div>
                      <div>initial, transmuted</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #1abc9c", padding: "20px", backgroundColor: "#1abc9c", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>ATTENDANCE</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (PK)</div>
                      <div>student_id (FK)</div>
                      <div>date</div>
                      <div>session (AM/PM)</div>
                      <div>status</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements & Logs */}
              <div style={{ display: "flex", gap: "40px", marginTop: "30px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #e67e22", padding: "20px", backgroundColor: "#e67e22", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>ANNOUNCEMENTS</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (PK)</div>
                      <div>user_id (FK)</div>
                      <div>title</div>
                      <div>content</div>
                      <div>date_posted</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ border: "3px solid #95a5a6", padding: "20px", backgroundColor: "#95a5a6", color: "#fff", fontWeight: "bold", textAlign: "center", minWidth: "130px", borderRadius: "4px" }}>
                    <div style={{ fontSize: "1.1em", marginBottom: "8px" }}>LOGS</div>
                    <div style={{ fontSize: "0.8em", borderTop: "1px solid #fff", paddingTop: "8px", marginTop: "8px" }}>
                      <div>id (PK)</div>
                      <div>user_id (FK)</div>
                      <div>action</div>
                      <div>timestamp</div>
                      <div>details</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #bdc3c7", fontSize: "0.9em", color: "#555" }}>
              <p><strong>Key:</strong> PK = Primary Key | FK = Foreign Key | 1:1 = One-to-One | 1:* = One-to-Many | *:* = Many-to-Many</p>
              <p><strong>Data Integrity:</strong> All relationships maintain referential integrity. Students and Teachers link to Users (role-based). Grades and Attendance reference Students. Announcements and Logs reference Users for audit trails.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>System Flowchart</h2>
        </div>
        <div className="card-body">
          <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "8px" }}>
            <div style={{ marginBottom: "40px" }}>
              <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Authentication &amp; Role-Based Access</h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                <div style={{ border: "2px solid #2c3e50", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#34495e", color: "#fff", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}>Start</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}>Login/Register</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}>Rate Limit Check</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}>Hash Verification</div>
                <div>↓</div>
                <div style={{ border: "2px solid #e74c3c", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#e74c3c", color: "#fff", fontWeight: "bold", minWidth: "150px", textAlign: "center" }}>Role Redirect</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: "30px", flexWrap: "wrap", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ border: "2px solid #27ae60", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", minWidth: "110px", textAlign: "center" }}>Admin</div>
                  <div>↓</div>
                  <div style={{ border: "2px solid #8e44ad", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#9b59b6", color: "#fff", fontWeight: "bold", minWidth: "110px", textAlign: "center", fontSize: "0.9em" }}>Dashboard &amp; CRUD</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ border: "2px solid #27ae60", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", minWidth: "110px", textAlign: "center" }}>Teacher</div>
                  <div>↓</div>
                  <div style={{ border: "2px solid #8e44ad", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#9b59b6", color: "#fff", fontWeight: "bold", minWidth: "110px", textAlign: "center", fontSize: "0.9em" }}>Grade &amp; Attend</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div style={{ border: "2px solid #27ae60", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", minWidth: "110px", textAlign: "center" }}>Student</div>
                  <div>↓</div>
                  <div style={{ border: "2px solid #8e44ad", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#9b59b6", color: "#fff", fontWeight: "bold", minWidth: "110px", textAlign: "center", fontSize: "0.9em" }}>View Records</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "40px", paddingTop: "30px", borderTop: "2px solid #bdc3c7" }}>
              <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Grading Process Flow</h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Input WW/PT/QA</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Initial Grade</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Apply Weights</div>
                <div>↓</div>
                <div style={{ border: "2px solid #c0392b", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#e74c3c", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>DepEd Transmutation</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Quarterly Grade</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Semester Finals</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Final Grade &amp; GWA</div>
                <div>↓</div>
                <div style={{ border: "2px solid #27ae60", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center" }}>Pass/Fail Decision</div>
              </div>
            </div>

            <div style={{ paddingTop: "30px", borderTop: "2px solid #bdc3c7" }}>
              <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Attendance Tracking Flow</h3>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "140px", textAlign: "center" }}>Select Date</div>
                <div>↓</div>
                <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "140px", textAlign: "center" }}>Mark AM/PM</div>
                <div>↓</div>
                <div style={{ border: "2px solid #e67e22", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#f39c12", color: "#fff", fontWeight: "bold", minWidth: "140px", textAlign: "center" }}>Record Exists?</div>
                <div style={{ display: "flex", justifyContent: "space-around", width: "100%", maxWidth: "350px", marginTop: "10px", gap: "30px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ color: "#c0392b", fontWeight: "bold", fontSize: "1.1em" }}>YES</div>
                    <div>↓</div>
                    <div style={{ border: "2px solid #c0392b", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#e74c3c", color: "#fff", fontWeight: "bold", minWidth: "100px", textAlign: "center", fontSize: "0.9em" }}>BLOCK</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ color: "#27ae60", fontWeight: "bold", fontSize: "1.1em" }}>NO</div>
                    <div>↓</div>
                    <div style={{ border: "2px solid #27ae60", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", minWidth: "100px", textAlign: "center", fontSize: "0.9em" }}>SAVE</div>
                  </div>
                </div>
                <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px dashed #bdc3c7", width: "100%", textAlign: "center" }}>
                  <div style={{ border: "2px solid #2980b9", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#3498db", color: "#fff", fontWeight: "bold", minWidth: "160px", textAlign: "center", margin: "0 auto 15px" }}>Count Absences</div>
                  <div>↓</div>
                  <div style={{ border: "2px solid #e67e22", padding: "15px 25px", borderRadius: "5px", backgroundColor: "#f39c12", color: "#fff", fontWeight: "bold", minWidth: "140px", textAlign: "center", margin: "15px auto" }}>Absences ≥ 3?</div>
                  <div style={{ display: "flex", justifyContent: "space-around", width: "100%", maxWidth: "300px", margin: "20px auto", gap: "30px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div style={{ color: "#c0392b", fontWeight: "bold", fontSize: "1.1em" }}>YES</div>
                      <div>↓</div>
                      <div style={{ border: "2px solid #c0392b", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#e74c3c", color: "#fff", fontWeight: "bold", minWidth: "100px", textAlign: "center", fontSize: "0.9em" }}>DROP OUT</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <div style={{ color: "#27ae60", fontWeight: "bold", fontSize: "1.1em" }}>NO</div>
                      <div>↓</div>
                      <div style={{ border: "2px solid #27ae60", padding: "12px 20px", borderRadius: "5px", backgroundColor: "#2ecc71", color: "#fff", fontWeight: "bold", minWidth: "100px", textAlign: "center", fontSize: "0.9em" }}>CONTINUE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
