import ContestReminderEmail from '@/emails/reminder';
import { Resend } from 'resend';
// import { Email } from './email';
// import ContestReminderEmail from '@/emails/reminder';

const resend = new Resend('');

export async function POST(req: Request) {
  const { email, subject, html } = await req.json();

  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['karthiknadar1204@gmail.com'],
      subject: 'hello world',
      react: ContestReminderEmail,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}