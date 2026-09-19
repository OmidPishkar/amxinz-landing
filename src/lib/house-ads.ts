// Direct-sold sponsor creatives. Replace the placeholder with a real advertiser,
// and get paid however you agree with them (a crypto wallet works fine).
export interface HouseAd {
  title: string;
  body: string;
  cta: string;
  href: string;
}

export const HOUSE_ADS: HouseAd[] = [
  {
    title: "Your ad could be here",
    body: "Reach people who practice reading charts every day. Book a full-screen slot on Amxinz and pay in crypto.",
    cta: "Advertise with us",
    href: "mailto:ads@amxinz.com", // TODO: replace with your real contact
  },
];
