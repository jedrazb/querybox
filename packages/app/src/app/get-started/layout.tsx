import { TestDemoProvider } from "@/components/TestDemoProvider";

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TestDemoProvider>{children}</TestDemoProvider>;
}
