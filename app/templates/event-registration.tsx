import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import siteConfig from "~/site.config";

interface EventRegistrationProps {
  name: string;
  eventName: string;
  description: string;
  imageUrl?: string;
}

const EventRegistration = ({
  name,
  eventName,
  description,
  imageUrl,
}: EventRegistrationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Registration successful for {eventName}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src={`${siteConfig.baseUrl}/logomark.png`}
                width="40"
                height="40"
                alt="Vercel"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Event registration successful!
            </Heading>
            <Section>
              <Text className="text-[14px] leading-[24px] text-black">
                Hello {name},
              </Text>
              <Text className="text-[14px] leading-[24px] text-black">
                You have successfully registered for{" "}
                <strong>{eventName}</strong>. <br />
                {description}
              </Text>
              {imageUrl && (
                <Img
                  src={imageUrl}
                  alt="Event"
                  className="mx-auto my-0 aspect-video h-[300px] object-contain"
                />
              )}
            </Section>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className="rounded-md bg-[#2563eb] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href=""
              >
                View Event
              </Button>
            </Section>
            <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-right text-[12px] leading-[24px] text-[#666666]">
              {siteConfig.name} &copy; 2024
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EventRegistration;