import { LocationDrawer } from "@/components/LocationDrawer";

export default function Home() {
  return (
    <>
      <div className="w-full flex place-items-center justify-center h-full bg-grey-200">
        <p>Map here</p>
      </div>

      <div className="absolute bottom-4 w-screen left-0">
        <div className="w-full px-8">
          <LocationDrawer />
        </div>
      </div>
    </>
  );
}
