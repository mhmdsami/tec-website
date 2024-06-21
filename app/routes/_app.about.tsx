export default function About() {
  const about = [
    {
      title: "Advocacy and Representation",
      content: [
        {
          title: "Policy Influence",
          content:
            "Economic chambers advocate for business-friendly policies and regulations at local, regional, national, and international levels. They represent the interests of their members in discussions with government officials and policymakers.",
        },
        {
          title: "Lobbying",
          content:
            "They engage in lobbying activities to influence legislation and economic policies that affect businesses.",
        },
      ],
    },
    {
      title: "Networking Opportunities",
      content: [
        {
          title: "Business Connections",
          content:
            "Chambers provide platforms for members to network, collaborate, and form strategic alliances. They organize events, meetings, and conferences where businesses can connect with potential partners, clients, and suppliers.",
        },
        {
          title: "Community Building",
          content:
            "By fostering relationships among local businesses, chambers contribute to building a cohesive and supportive business community.",
        },
      ],
    },
    {
      title: "Business Support and Services",
      content: [
        {
          title: "Resources and Information",
          content:
            "They offer access to valuable resources, market research, and industry-specific information. This helps businesses make informed decisions and stay competitive.",
        },
        {
          title: "Training and Development",
          content:
            "Chambers often provide workshops, seminars, and training programs to help businesses enhance their skills, knowledge, and capabilities.",
        },
      ],
    },
    {
      title: "Economic Development",
      content: [
        {
          title: "Promotion of Trade and Investment",
          content:
            "Chambers work to attract investment, promote exports, and encourage trade opportunities for local businesses.",
        },
        {
          title: "Support for Startups and SMEs",
          content:
            "They offer specialized support and programs for startups and small to medium-sized enterprises (SMEs), helping them to grow and thrive.",
        },
      ],
    },
    {
      title: "Public Relations and Marketing",
      content: [
        {
          title: "Visibility and Exposure",
          content:
            "Chambers help businesses increase their visibility and market presence through various promotional activities, events, and publications.",
        },
        {
          title: "Community Engagement",
          content:
            "They engage with the community to enhance the local business environment, promote economic growth, and improve the quality of life for residents.",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {about.map(({ title, content }, idx) => (
        <div className="flex flex-col">
          <h2 className="gap-2 text-2xl font-semibold">{title}</h2>
          {content.map(({ title, content }, idx) => (
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-lg">{content}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
