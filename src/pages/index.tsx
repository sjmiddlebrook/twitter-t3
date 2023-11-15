import { NewTweet } from "@/components/NewTweet";

export default function Home() {
  return (
    <>
      <header className="top sticky z-10 border-b bg-white py-4">
        <h1 className="px-4 text-lg font-semibold">Home</h1>
      </header>
      <NewTweet />
    </>
  );
}
