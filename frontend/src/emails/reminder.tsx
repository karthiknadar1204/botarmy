import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ContestReminderEmailProps {
  emailId?: string;
  contestName?: string;
  startTime?: Date;
  platform?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const ContestReminderEmail = ({
  emailId,
  contestName,
  startTime,
  platform,
}: ContestReminderEmailProps) => {
  const formattedDate = new Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(startTime);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Contest Reminder: {contestName}</Preview>
        <Container>
          <Section style={content}>
            <Heading
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Hi {emailId},
            </Heading>
            <Heading
              as="h2"
              style={{
                fontSize: 26,
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              This is a reminder for your upcoming contest!
            </Heading>

            <Text style={paragraph}>
              <b>Contest: </b>
              {contestName}
            </Text>
            <Text style={{ ...paragraph, marginTop: -5 }}>
              <b>Platform: </b>
              {platform}
            </Text>
            <Text style={{ ...paragraph, marginTop: -5 }}>
              <b>Start Time: </b>
              {formattedDate}
            </Text>

            <Text style={paragraph}>
              Good luck with your contest! Make sure to join on time.
            </Text>
          </Section>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'rgb(0,0,0, 0.7)',
            }}
          >
            © 2024 | Contest Reminder Service
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

ContestReminderEmail.PreviewProps = {
  emailId: 'user@example.com',
  contestName: 'Weekly Contest 123',
  startTime: new Date('January 20, 2024, 10:30 am'),
  platform: 'LeetCode',
} as ContestReminderEmailProps;

export default ContestReminderEmail;

const main = {
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  padding: '20px',
  overflow: 'hidden',
};