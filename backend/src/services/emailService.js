import nodemailer from "nodemailer";

// Create SMTP transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
};

/**
 * Send teacher approval email
 * @param {string} teacherEmail - Teacher's email address
 * @param {string} teacherName - Teacher's name
 */
export const sendTeacherApprovalEmail = async (teacherEmail, teacherName) => {
  try {
    // Development mode - log email instead of sending
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === "your-email@gmail.com") {
      console.log("\n📧 [DEV MODE] Teacher Approval Email:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${teacherEmail}`);
      console.log(`Subject: 🎉 Congratulations! Your Teacher Account has been Approved`);
      console.log(`\nHello ${teacherName},`);
      console.log(`\nYour teacher account has been APPROVED! ✅`);
      console.log(`You can now create courses, manage students, and access all teacher features.`);
      console.log(`\nDashboard: ${process.env.CLIENT_URL || "http://localhost:5173"}/teacher`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return { success: true, mode: "development" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MindQuest Team" <${process.env.SMTP_USER}>`,
      to: teacherEmail,
      subject: "🎉 Congratulations! Your Teacher Account has been Approved",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to MindQuest!</h1>
            </div>
            <div class="content">
              <h2>Hello ${teacherName},</h2>
              <p>We are thrilled to inform you that your teacher account has been <strong>approved</strong>!</p>
              <p>You can now access all teacher features on MindQuest, including:</p>
              <ul>
                <li>Create and publish engaging courses</li>
                <li>Manage your students and track their progress</li>
                <li>Build interactive lessons with our studio tools</li>
                <li>Connect with learners through our chat system</li>
              </ul>
              <p>Start creating your first course and inspire students around the world!</p>
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/teacher" class="button">Go to Dashboard</a>
              <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
              <p><strong>Happy Teaching!</strong><br>The MindQuest Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MindQuest. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Approval email sent to ${teacherEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending approval email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send teacher rejection email
 * @param {string} teacherEmail - Teacher's email address
 * @param {string} teacherName - Teacher's name
 * @param {string} reason - Rejection reason
 */
export const sendTeacherRejectionEmail = async (teacherEmail, teacherName, reason) => {
  try {
    // Development mode - log email instead of sending
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === "your-email@gmail.com") {
      console.log("\n📧 [DEV MODE] Teacher Rejection Email:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${teacherEmail}`);
      console.log(`Subject: Update on Your MindQuest Teacher Application`);
      console.log(`\nHello ${teacherName},`);
      console.log(`\nYour teacher application has been REJECTED. ❌`);
      console.log(`\n📋 Reason: ${reason || "No specific reason provided"}`);
      console.log(`\nYou can review the feedback and reapply once the issues are addressed.`);
      console.log(`Contact: ${process.env.CLIENT_URL || "http://localhost:5173"}/contact`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return { success: true, mode: "development" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MindQuest Team" <${process.env.SMTP_USER}>`,
      to: teacherEmail,
      subject: "Update on Your MindQuest Teacher Application",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${teacherName},</h2>
              <p>Thank you for your interest in becoming a teacher on MindQuest.</p>
              <p>After careful review, we regret to inform you that we are unable to approve your teacher account at this time.</p>
              
              ${reason ? `
              <div class="reason-box">
                <strong>📋 Reason:</strong>
                <p style="margin: 10px 0 0 0;">${reason}</p>
              </div>
              ` : ""}
              
              <p>We encourage you to:</p>
              <ul>
                <li>Review the provided feedback and address any concerns</li>
                <li>Ensure all required documentation is complete and accurate</li>
                <li>Reapply once you've addressed the issues mentioned</li>
              </ul>
              
              <p>If you believe this decision was made in error or have questions, please don't hesitate to contact our support team.</p>
              
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/contact" class="button">Contact Support</a>
              
              <p style="margin-top: 30px;">We appreciate your understanding and hope to work with you in the future.</p>
              <p><strong>Best regards,</strong><br>The MindQuest Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MindQuest. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${teacherEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending rejection email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send user banned email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} role - User's role
 * @param {string} reason - Ban reason
 */
export const sendUserBannedEmail = async (userEmail, userName, role, reason) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === "your-email@gmail.com") {
      console.log("\n📧 [DEV MODE] User Banned Email:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Your MindQuest Account Has Been Banned`);
      console.log(`\nHello ${userName},`);
      console.log(`\nYour account has been BANNED. ❌`);
      console.log(`Role: ${role}`);
      console.log(`\n📋 Reason: ${reason || "No specific reason provided"}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return { success: true, mode: "development" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MindQuest Team" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Your MindQuest Account Has Been Banned",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f5576c 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Suspended</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Your account has been <strong>banned</strong> from MindQuest.</p>
              ${reason ? `
              <div class="reason-box">
                <strong>📋 Reason:</strong>
                <p style="margin: 10px 0 0 0;">${reason}</p>
              </div>
              ` : ""}
              <p>If you believe this is a mistake or would like to appeal, please contact our support team.</p>
              <p><strong>Best regards,</strong><br>The MindQuest Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MindQuest. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Ban email sent to ${userEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending ban email:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send user unbanned email
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} role - User's role
 */
export const sendUserUnbannedEmail = async (userEmail, userName, role) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === "your-email@gmail.com") {
      console.log("\n📧 [DEV MODE] User Unbanned Email:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Your MindQuest Account Has Been Reinstated`);
      console.log(`\nHello ${userName},`);
      console.log(`\nYour account has been UNBANNED. ✅`);
      console.log(`Role: ${role}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return { success: true, mode: "development" };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"MindQuest Team" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Your MindQuest Account Has Been Reinstated",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Account Reinstated</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Good news! Your account has been <strong>unbanned</strong> and access is now restored.</p>
              <p>You can now log in and use all features of MindQuest.</p>
              <p><strong>Welcome back!</strong><br>The MindQuest Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MindQuest. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Unban email sent to ${userEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending unban email:", error);
    return { success: false, error: error.message };
  }
};
