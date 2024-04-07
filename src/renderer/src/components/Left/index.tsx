import { DashboardIcon, FileTextIcon } from "@radix-ui/react-icons";
import { TooltipProvider } from "../ui/tooltip";
import { BOARD, CARD, ALL } from "@renderer/lib/consts";
import { cn } from "@renderer/lib/utils";
import { useState, useEffect, ReactNode } from "react";
import { BoardDialog, useBoardStore, Board, BoardTooltip } from "../Board";
import { useCardStore, Card } from "../Card";
import { CardTooltip } from "../Card/CardDraggable";
import { useViewStore } from "../View";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";


type SortCallback = ((a: Card, b: Card) => number) | undefined;
const sortZA: SortCallback = (a, b) =>
  a?.title?.localeCompare(b?.title ?? "") ?? 0;
const sortAZ: SortCallback = (a, b) =>
  -1 * (a.title?.localeCompare(b?.title ?? "") ?? 0);
const sortNewest: SortCallback = (a, b) => Number(a.id) - Number(b.id);
const sortOldest: SortCallback = (a, b) => Number(b.id) - Number(a.id);





export const Left = () => {
    const [boardDialogOpen, setBoardDialogOpen] = useState(false);
    return (
      <>
        <div className="flex h-full w-full flex-col items-center justify-start gap-5">
          <div className="flex h-fit w-1/2 items-center justify-center gap-5">
            <Button
              onClick={() => setBoardDialogOpen((b) => !b)}
              className="w-full min-w-20 max-w-36"
            >
              Add board
            </Button>
            <Button
              variant={"outline"}
              disabled
              className="w-full min-w-20 max-w-36"
            >
              Add view
            </Button>
          </div>
          <BoardsAccordion />
          <CardsAccordion />
        </div>
        <BoardDialog open={boardDialogOpen} setOpen={setBoardDialogOpen} />
      </>
    );
  };
  const BoardsAccordion = () => {
    const { boards } = useBoardStore();
    const { currentView, setView } = useViewStore();
    const [sortCb, setSortCb] = useState<SortCallback>(() => sortAZ);
    const [sortType, setSortType] = useState("sortAZ");
  
    useEffect(() => {
      switch (sortType) {
        case "sortAZ":
          return setSortCb(() => sortAZ);
        case "sortZA":
          return setSortCb(() => sortZA);
        case "sortNewest":
          return setSortCb(() => sortNewest);
        case "sortOldest":
          return setSortCb(() => sortOldest);
      }
    }, [sortType]);
  
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue={currentView.itemType === BOARD ? "item-1" : undefined}
        className="w-full"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="w-full">Boards</AccordionTrigger>
          <AccordionContent className="w-full p-1">
            <Select value={sortType} onValueChange={(v) => setSortType(v)}>
              <SelectTrigger className="mb-1 w-fit gap-1 border-none">
                <div className="text-muted-foreground">Sort by</div>
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Title</SelectLabel>
                  <SelectItem value={"sortAZ"}>A to Z</SelectItem>
                  <SelectItem value={"sortZA"}>Z to A</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Creation</SelectLabel>
                  <SelectItem value={"sortNewest"}>Newest first</SelectItem>
                  <SelectItem value={"sortOldest"}>Oldest first</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex w-full flex-col gap-1">
              <div
                onClick={() => {
                  setView({ itemId: ALL, itemType: BOARD });
                }}
              >
                <a
                  className={cn(
                    "flex cursor-pointer items-center justify-start gap-1 rounded-sm p-2 hover:bg-secondary hover:text-secondary-foreground hover:underline hover:underline-offset-2",
                    currentView.itemType === BOARD && currentView.itemId === ALL
                      ? "bg-secondary text-secondary-foreground"
                      : "",
                  )}
                >
                  <DashboardIcon />
                  All boards
                </a>
              </div>
              {boards
                ?.toSorted(sortCb)
                .map((b) => (
                  <BoardNavItem
                    key={`${b.id}-board-left-nav-button`}
                    {...b}
                    className={
                      currentView.itemType === BOARD &&
                      currentView.itemId === b.id
                        ? "bg-secondary text-secondary-foreground"
                        : ""
                    }
                  />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };
  
  const BoardNavItem = (props: Board & { className?: string }) => {
    const { id, title, description, notes, className } = props;
    const { cards } = useCardStore();
    const { setView } = useViewStore();
    const [isHover, setIsHover] = useState(false);
    return (
      <TooltipProvider>
        <div className="relative">
          <div
            onClick={() => {
              setView({ itemId: id, itemType: BOARD });
            }}
          >
            <a
              className={cn(
                `flex cursor-pointer flex-col items-start justify-center gap-1`,
              )}
            >
              <div
                className={cn(
                  "roudned-sm flex w-full items-center justify-start gap-1 rounded-sm p-2",
                )}
              >
                <CardsAccordion
                  cards={cards?.filter((c) => c.board === id)}
                  triggerClassName={className}
                  trigger={
                    <div className="flex items-center gap-1">
                      <FileTextIcon className={!!notes ? "text-primary" : ""} />
                      <span
                        onMouseOver={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                      >
                        {title}
                      </span>
                    </div>
                  }
                />
              </div>
              {/* <div className="w-full pl-5">
                <CardsAccordion cards={cards?.filter((c) => c.board === id)} />
              </div> */}
            </a>
            <BoardTooltip
              {...props}
              isHover={isHover}
              setIsHover={setIsHover}
              triggerClassName="-right-28"
              includeDefaultData
              data={
                <div className="pb-2">
                  <div className="text-foreground">{title}</div>
                  <div>{description}</div>
                </div>
              }
            />
          </div>
        </div>
      </TooltipProvider>
    );
  };
  
  const CardsAccordion = (props: {
    cards?: Card[];
    trigger?: ReactNode;
    triggerClassName?: string;
  }) => {
    const cards = props.cards ?? useCardStore().cards;
    const { currentView, setView } = useViewStore();
    const [sortCb, setSortCb] = useState<SortCallback>(() => sortAZ);
    const [sortType, setSortType] = useState("sortAZ");
  
    useEffect(() => {
      switch (sortType) {
        case "sortAZ":
          return setSortCb(() => sortAZ);
        case "sortZA":
          return setSortCb(() => sortZA);
        case "sortNewest":
          return setSortCb(() => sortNewest);
        case "sortOldest":
          return setSortCb(() => sortOldest);
      }
    }, [sortType]);
  
    return (
      <Accordion
        defaultValue={currentView.itemType === CARD ? "item-1" : undefined}
        type="single"
        collapsible
        className="w-full"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger
            className={cn("w-full rounded-sm p-2", props.triggerClassName)}
          >
            {props.trigger ?? "Cards"}
          </AccordionTrigger>
          <AccordionContent className={"w-full p-1"}>
            <Select value={sortType} onValueChange={(v) => setSortType(v)}>
              <SelectTrigger className="mb-1 w-fit gap-1 border-none">
                <div className="text-muted-foreground">Sort by</div>
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Title</SelectLabel>
                  <SelectItem value={"sortAZ"}>A to Z</SelectItem>
                  <SelectItem value={"sortZA"}>Z to A</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Creation</SelectLabel>
                  <SelectItem value={"sortNewest"}>Newest first</SelectItem>
                  <SelectItem value={"sortOldest"}>Oldest first</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex w-full flex-col gap-1">
              <div
                onClick={() => {
                  setView({ itemId: ALL, itemType: BOARD });
                }}
              >
                <a
                  className={cn(
                    "flex cursor-pointer items-center justify-start gap-1 rounded-sm p-2 hover:bg-secondary hover:text-secondary-foreground hover:underline hover:underline-offset-2",
                    currentView.itemType === CARD && currentView.itemId === ALL
                      ? "bg-secondary text-secondary-foreground"
                      : "",
                  )}
                >
                  <DashboardIcon />
                  All cards
                </a>
              </div>
              {cards
                ?.toSorted(sortCb)
                .map((c) => (
                  <CardNavItem
                    key={`${c.id}-card-left-nav-button`}
                    {...c}
                    className={
                      currentView.itemType === CARD && currentView.itemId === c.id
                        ? "bg-secondary text-secondary-foreground"
                        : ""
                    }
                  />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };
  
  const CardNavItem = (props: Card & { className?: string }) => {
    const { id, title, description, notes, className } = props;
    const { setView } = useViewStore();
    const [isHover, setIsHover] = useState(false);
    return (
      <TooltipProvider>
        <div className="relative">
          <div
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onClick={(e) => {
              // setTimeout(() => {
              setView({ itemId: id, itemType: CARD });
              e.stopPropagation();
              // }, 0);
            }}
          >
            <a
              onClick={() => {
                setView({ itemId: id, itemType: CARD });
              }}
              className={cn(
                `flex cursor-pointer items-center justify-start gap-1 rounded-sm p-2 hover:bg-secondary hover:text-secondary-foreground hover:underline hover:underline-offset-2`,
                className,
              )}
            >
              <FileTextIcon className={!!notes ? "text-primary" : ""} />
              {title}
            </a>
            <CardTooltip
              {...props}
              isHover={isHover}
              setIsHover={setIsHover}
              triggerClassName="-right-28"
              includeDefaultData
              data={
                <div className="pb-2">
                  <div className="text-foreground">{title}</div>
                  <div>{description}</div>
                </div>
              }
            />
          </div>
        </div>
      </TooltipProvider>
    );
  };