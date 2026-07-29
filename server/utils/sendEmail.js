import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email via Nodemailer.
 * @param {object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    // Don't throw — email failures shouldn't break the API flow
  }
};

// Email templates
export const emailTemplates = {
  organizerApproved: (name) => ({
    subject: '🎉 Your DevArena Organizer Account is Approved!',
    html: `<h2>Hi ${name},</h2><p>Your Organizer account on <strong>DevArena</strong> has been approved. You can now log in and start creating hackathons!</p>`,
  }),
  judgeApproved: (name) => ({
    subject: '🎉 Your DevArena Judge Account is Approved!',
    html: `<h2>Hi ${name},</h2><p>Your Judge account on <strong>DevArena</strong> has been approved. You can now log in and await hackathon assignments.</p>`,
  }),
  accountRejected: (name, reason) => ({
    subject: 'DevArena Account Request Update',
    html: `<h2>Hi ${name},</h2><p>Unfortunately, your account request has been rejected.</p>${reason ? `<p>Reason: ${reason}</p>` : ''}`,
  }),
  teamJoined: (name, teamName, hackathonTitle) => ({
    subject: `✅ You joined team "${teamName}" on DevArena`,
    html: `<h2>Hi ${name},</h2><p>You've successfully joined <strong>${teamName}</strong> for <strong>${hackathonTitle}</strong>. Good luck!</p>`,
  }),
  registrationConfirmed: (name, hackathonTitle) => ({
    subject: `Registration Confirmed — ${hackathonTitle}`,
    html: `<h2>Hi ${name},</h2><p>You're registered for <strong>${hackathonTitle}</strong> on DevArena. Create or join your team to get started!</p>`,
  }),
  resultsPublished: (name, hackathonTitle) => ({
    subject: `📊 Results Published — ${hackathonTitle}`,
    html: `<h2>Hi ${name},</h2><p>The results for <strong>${hackathonTitle}</strong> have been published. Check the leaderboard on DevArena!</p>`,
  }),
};
