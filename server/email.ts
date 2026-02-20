
import nodemailer from "nodemailer";

interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

// Replace with your actual email service credentials or use environment variables
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USERNAME || "digee12@gmail.com",
        pass: process.env.MAIL_PASSWORD || "your-app-password",
    },
});

export async function sendEmail({ to, subject, html }: MailOptions): Promise<boolean> {
    try {
        const mailOptions = {
            from: process.env.MAIL_USERNAME || "digee12@gmail.com",
            to,
            subject,
            html,
        };

        const info = await transport.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

export async function sendOrderNotification(adminEmail: string, orderDetails: any) {
    const subject = `New Order #${orderDetails.id.substring(0, 8)}`;
    const html = `
      <h1>New Order Received</h1>
      <p>Order ID: ${orderDetails.id}</p>
      <p>Customer: ${orderDetails.customerName}</p>
      <p>Total: ${orderDetails.totalAmount}</p>
      <p>View order details in the admin panel.</p>
    `;
    return sendEmail({ to: adminEmail, subject, html });
}

export async function sendContactNotification(adminEmail: string, messageDetails: any) {
    const subject = `New Contact Message from ${messageDetails.name}`;
    const html = `
      <h1>New Contact Message</h1>
      <p>From: ${messageDetails.name} (${messageDetails.email})</p>
      <p>Subject: ${messageDetails.subject}</p>
      <p>Message: ${messageDetails.message}</p>
    `;
    return sendEmail({ to: adminEmail, subject, html });
}
