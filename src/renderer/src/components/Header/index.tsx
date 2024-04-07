import { GearIcon } from "@radix-ui/react-icons";
import { downloadToFile } from "@renderer/lib/utils";
import { toast } from "sonner";
import { useBoardStore } from "../Board";
import { useCardStore } from "../Card";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import citrineLogo from "@/assets/citrine_logo.svg";
import { Progress } from "../ui/progress";
import { useTheme } from "../ThemeProvider";

export const Header = () => {
  /**
   * Gets the number of bytes being used in localStorage
   * @returns number of bytes
   */
  const getLsUsage = () => {
    return Object.keys(localStorage).reduce((acc, val) => {
      if (!localStorage.hasOwnProperty(val)) return acc;
      const len = ((localStorage.getItem(val)?.length ?? 0) + val.length) * 2;
      return acc + len;
    }, 0);
  };
  const kbUsed = getLsUsage() / 1024;
  const percentUsed = ((kbUsed / 5120) * 100).toFixed(2);
  return (
    <div className="absolute inset-0 flex flex-row">
      <div className="flex h-full w-fit items-center justify-center gap-3 px-10">
        <img src={citrineLogo} alt="citrine logo" height={50} width={50} />
        <span className="font-mono text-5xl font-extrabold">citrine</span>
      </div>
      <nav className="flex h-full w-full flex-row items-center justify-center gap-5">
        {/* <Select>
            <SelectTrigger defaultValue={"all"} className="w-fit">
              All Boards
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
            </SelectContent>
          </Select> */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex h-fit w-48 items-center justify-center gap-2 rounded-md">
                Storage
                <Progress value={kbUsed} max={5120} className="rounded-sm" />
              </div>
            </TooltipTrigger>
            <TooltipContent align="end">
              <div>{kbUsed.toFixed(2)} kb used / 5120 kb available</div>
              <div>
                {percentUsed}% used and {100 - Number(percentUsed)}% available
              </div>
              <em className="text-muted-foreground">
                last updated {new Date().toLocaleString("en-US")}
              </em>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <a
          href="https://github.com/unxok/citrine"
          className="hover:underline hover:underline-offset-4"
        >
          About
        </a>
        <a
          href="https://github.com/unxok/citrine"
          className="hover:underline hover:underline-offset-4"
        >
          Community
        </a>
        <a
          href="https://github.com/unxok/citrine"
          className="hover:underline hover:underline-offset-4"
        >
          Docs
        </a>
      </nav>
      <div className="flex items-center justify-end px-10">
        <SettingsSheet />
      </div>
    </div>
  );
};

export const SettingsSheet = () => {
  const { theme, setTheme } = useTheme();
  const { cards } = useCardStore();
  const { boards } = useBoardStore();

  const copyLSToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(localStorage));
    toast.success("Save data copied to clipboard");
  };

  const exportToFile = () => {
    downloadToFile(
      JSON.stringify(localStorage),
      "save.citrine",
      "application/json",
    );
  };

  const importFromFile = () => {
    const inp = document.createElement("input");
    const reader = new FileReader();
    inp.type = "file";

    inp.addEventListener("change", () => {
      const file = inp?.files?.[0];
      if (!file) {
        toast.error("Import save data failed! \nNo data was provided");
        return;
      }
      reader.readAsText(file);
    });

    reader.addEventListener("load", () => {
      if (!(typeof reader.result === "string")) {
        toast.error("Import save data failed!\nUnexpected file contents");
        return;
      }
      try {
        const json = JSON.parse(reader.result);
        Object.keys(json).forEach((k) => localStorage.setItem(k, json[k]));
        window.location.reload();
        return;
      } catch (e) {
        toast.error(
          "Import save data failed! \nCheck console for more information",
        );
        console.error(
          "Error occured when attempting to parse JSON from text provided. ",
          e,
        );
        return;
      }
    });

    inp.click();
  };

  const importLSFromClipboard = () => {
    const text = window.prompt("Please paste your save data below");
    if (!text) {
      toast.error("Import save data failed! \nNo data was provided");
      return;
    }
    try {
      const json = JSON.parse(text);
      Object.keys(json).forEach((k) => localStorage.setItem(k, json[k]));
      window.location.reload();
      return;
    } catch (e) {
      toast.error(
        "Import save data failed! \nCheck console for more information",
      );
      console.error(
        "Error occured when attempting to parse JSON from text provided. ",
        e,
      );
      return;
    }
  };

  const exportToCSV = (delim: string) => {
    if (!cards || !boards) {
      return toast.error("There are no cards to export!");
    }
    const header =
      [
        "Id",
        "Title",
        "Description",
        "Board",
        "Lane",
        "Notes",
        "Created",
        "Modified",
      ].join(delim) + "\n";
    const csv =
      header +
      cards.reduce((acc, card) => {
        const boardTitle = boards.find((b) => b.id === card.board)?.title;
        const laneTitle = boards
          .find((b) => b.id === card.board)
          ?.lanes?.find((l) => l.id === card.lane)?.title;
        const arr = [
          `${card.id}`,
          `"${card?.title}"`,
          `"${card?.description}"`,
          `"${boardTitle}"`,
          `"${laneTitle}"`,
          `"${card?.notes}"`,
          `"${card?.created}"`,
          `"${card?.modified}"`,
        ];
        const row = arr.join(delim);
        return acc + "\n" + row;
      }, "");
    downloadToFile(csv, "citrine.csv", "text/csv");
  };

  const exportToHTML = () => {
    const html = document.documentElement.innerHTML;
    downloadToFile(html, "citrine.html", "text/html");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"ghost"} className="group">
          <GearIcon
            width={20}
            height={20}
            className="group-hover:animate-spin"
          />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tools & Settings</SheetTitle>
          <SheetDescription>
            <div>Export</div>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => copyLSToClipboard()}
            >
              To clipboard
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => exportToFile()}
            >
              To save file
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => {
                const delim = window.prompt(
                  "Please enter what will be the delimeter for your columns",
                );
                if (!delim) {
                  return toast.error("You must enter a non-empty character");
                }
                exportToCSV(delim);
              }}
            >
              To CSV file
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => {
                exportToHTML();
              }}
            >
              To HTML file
            </Button>
            <div>Import</div>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => importLSFromClipboard()}
            >
              From clipboard
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => importFromFile()}
            >
              From save file
            </Button>
            <div>Theme</div>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => setTheme("light")}
              disabled={theme === "light"}
            >
              Light
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => setTheme("dark")}
              disabled={theme === "dark"}
            >
              Dark
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => setTheme("system")}
              disabled={theme === "system"}
            >
              Custom
            </Button>
            <div className="pt-24">
              <div className="rounded-md border border-destructive bg-destructive/10 p-5 text-foreground">
                <div className="pb-3 text-lg">Danger Zone</div>
                <Button
                  variant={"destructive"}
                  className="w-full justify-start"
                  onClick={() => {
                    const confirmation = window.confirm(
                      "Are you sure? This will permanently delete all your data!",
                    );
                    if (!confirmation) return;
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Clear all data
                </Button>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
