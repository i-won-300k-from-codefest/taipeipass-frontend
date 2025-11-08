import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerDescription,
  DrawerClose,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";

export function LocationDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">我在哪裡</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>你媽確定嗎？</DrawerTitle>
          <DrawerDescription>困難</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
