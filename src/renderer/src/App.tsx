import { ThemeProvider } from "./components/ThemeProvider";
import citrineLogo from "@/assets/citrine_logo.svg";
import { buttonVariants } from "./components/ui/button";
import { useEffect, useState } from "react";
import { LayersIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

type VaultState = {
  vaultName?: string;
  files?: { name: string; extension: string; path: string }[];
};

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send("ping");
  const backend = window.electron.ipcRenderer;
  const [vault, setVault] = useState<VaultState>();

  useEffect(() => console.log("vault: ", vault), [vault]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed inset-0 flex w-full flex-col bg-background text-foreground">
        <header className="flex w-full items-center justify-start gap-3 border-b p-1">
          <img alt="logo" src={citrineLogo} className="h-5 w-5" />
          Im the header
        </header>
        <div className="inset-0 flex h-full w-fit">
          <aside className="flex size-full flex-col justify-between gap-3 bg-secondary p-1">
            <nav className="flex flex-col items-start justify-start">
              {vault?.files?.map((f) => (
                <TooltipProvider key={f.name + "aside-item"}>
                  <Tooltip>
                    <TooltipTrigger className="flex w-full justify-start rounded-md bg-transparent p-2 hover:bg-muted">
                      {f.name}
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col text-muted-foreground">
                      <div>
                        {f.name}.{f.extension}
                      </div>
                      <div>{f.path}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </nav>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className={buttonVariants({ variant: "ghost" })}
                  onClick={async () => {
                    const newVaultState: VaultState =
                      await backend.invoke("open-vault");
                    setVault(newVaultState);
                  }}
                >
                  <LayersIcon />
                </TooltipTrigger>
                <TooltipContent>
                  {vault ? "Change vault" : "Open Vault"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </aside>
          <main className="p-2">
            <article>main</article>
          </main>
        </div>
        asdfsad
      </div>
    </ThemeProvider>
  );
}

// function App() {
//   const { cards, setCards, saveCards, activeCard, setActiveCardId } =
//     useCardStore();
//   const { boards } = useBoardStore();
//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     }),
//   );
//   const { currentView } = useViewStore();
//   const getCurrentBoard = () => {
//     if (currentView.itemType !== BOARD) return;
//     const foundBoard = boards?.find((b) => b.id === currentView.itemId);
//     return foundBoard;
//   };
//   const getCurrentCard = () => {
//     if (currentView.itemType !== CARD) return;
//     const foundCard = cards?.find((b) => b.id === currentView.itemId);
//     return foundCard;
//   };
//   const currentBoard = getCurrentBoard();
//   const currentCard = getCurrentCard();
//   console.log("view: ", currentView);
//   // useEffect(() => console.log(cards), [cards]);

//   // useEffect(() => {
//   //   loadCards();
//   // }, []);

//   const getBoardAndLaneId = (over: Over, oldCard: Card) => {
//     const { itemType, boardId } = over.data.current || {};
//     if (!itemType) return { laneId: oldCard.lane, boardId: oldCard.board };
//     if (itemType === "card")
//       return {
//         laneId: over?.data?.current?.sortable.containerId as string,
//         boardId: boardId as string,
//       };
//     if (itemType === "lane") return { laneId: over.id, boardId: boardId };
//     return { laneId: "", boardId: "" };
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     setActiveCardId(null);
//     if (active.id !== over?.id) {
//       if ((over?.data.current?.itemType as string) === "lane") {
//         // handleDragOver already changed the lane
//         // so just save
//         return saveCards();
//       }
//       return setCards((items) => {
//         if (!items) return items;
//         const oldIndex = items.findIndex(
//           (item) => item.id === Number(active?.id),
//         );
//         const newIndex = items.findIndex(
//           (item) => item.id === Number(over?.id),
//         );
//         const newCards = arrayMove(items, oldIndex, newIndex);
//         saveCards(newCards);
//         return newCards;
//       });
//     }
//     saveCards();
//   };

//   const handleDragOver = (event: DragOverEvent) => {
//     const { active, over } = event;
//     // console.log("active: ", active);
//     // console.log("over: ", over);

//     setActiveCardId(active.id);
//     if (active.id !== over?.id) {
//       setTimeout(
//         () =>
//           setCards((items) => {
//             if (!over?.id) {
//               throw new Error("This should be impossible");
//             }
//             if (!items) return items;
//             const oldIndex = items?.findIndex(
//               (item) => item.id === Number(active?.id),
//             );
//             if (oldIndex === -1) {
//               return items;
//             }
//             const copyItems = [...items];
//             const oldCard = { ...copyItems[oldIndex] };
//             const { laneId, boardId } = getBoardAndLaneId(over, oldCard);
//             copyItems[oldIndex] = {
//               ...oldCard,
//               lane: laneId,
//               board: boardId,
//               modified: new Date().toLocaleString("en-US"),
//             };
//             return copyItems;
//           }),
//         0,
//       );
//     }
//   };

//   return (
//     <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//         onDragOver={handleDragOver}
//       >
//         <Toaster richColors toastOptions={{}} visibleToasts={100} />
//         <ResizablePanelGroup
//           direction="vertical"
//           autoSaveId={"layout-save"}
//           className="fixed inset-0 bg-background text-foreground"
//         >
//           <ResizablePanel
//             className="relative"
//             minSize={5}
//             defaultSize={10}
//             collapsible
//             collapsedSize={0}
//           >
//             <Header />
//           </ResizablePanel>
//           <ResizableHandle />
//           <ResizablePanel className="h-full w-full">
//             <ResizablePanelGroup
//               direction="horizontal"
//               autoSaveId={"layout-center-save"}
//               className="bg-background text-foreground"
//             >
//               <ResizablePanel
//                 className="h-full w-full !overflow-y-auto text-nowrap p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary data-[panel-size='0.0']:hidden"
//                 minSize={10}
//                 defaultSize={20}
//                 collapsible
//                 collapsedSize={0}
//               >
//                 <Left />
//               </ResizablePanel>
//               <ResizableHandle
//                 className={`data-[resize-handle-state=inactive]:`}
//               />
//               <ResizablePanel className="relative">
//                 <div className="flex h-full w-full flex-col items-start justify-start gap-5 !overflow-auto p-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary">
//                   {currentView.itemId === ALL &&
//                     currentView.itemType === BOARD &&
//                     boards?.map((b) => (
//                       <Board
//                         key={b.id + "-board-center"}
//                         {...b}
//                         cards={cards?.filter((c) => c.board === b.id)}
//                       />
//                     ))}
//                   {currentView.itemId === ALL &&
//                     currentView.itemType === CARD &&
//                     cards?.map((c) => (
//                       <CardView key={c.id + "-card-center"} {...c} />
//                     ))}
//                   {currentView.itemType === BOARD && currentBoard && (
//                     <Board
//                       {...currentBoard}
//                       cards={cards?.filter((c) => c.board === currentBoard.id)}
//                     />
//                   )}
//                   {currentView.itemType === CARD && currentCard && (
//                     <CardView {...currentCard} />
//                   )}
//                 </div>
//               </ResizablePanel>
//             </ResizablePanelGroup>
//           </ResizablePanel>
//         </ResizablePanelGroup>
//         <DragOverlay>
//           {activeCard ? <CardPresentational {...activeCard} /> : null}
//         </DragOverlay>
//       </DndContext>
//     </ThemeProvider>
//   );
// }

export default App;
