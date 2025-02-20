"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useState } from "react";

export function VoiceSelect<
  T extends { shortName: string; localName?: string }
>({
  voiceList,
  voice,
  setVoice,
}: {
  voiceList: T[];
  voice: T | null;
  setVoice: (voice: T | null) => void;
}) {
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const filteredVoices = voiceList.filter((v) => {
    return (
      v.localName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      v.shortName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-1">
      <Label>语音</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between w-full")}
          >
            {voice?.localName || voice?.shortName || "Select a voice"}
            <ChevronsUpDown className="opacity-50" size={10} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("p-0")}>
          <Command>
            <div className="relative border-b w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search voices...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus-visible:ring-0 rounded-b-none border-none pl-8 flex-1"
              />
            </div>
            <CommandList>
              <CommandEmpty>No voice loaded.</CommandEmpty>
              <CommandGroup>
                {filteredVoices.map((option) => (
                  <CommandItem
                    key={option.shortName}
                    value={option.shortName}
                    onSelect={(currentValue) => {
                      setVoice(
                        voiceList.find((v) => v.shortName === currentValue) ||
                          null
                      );
                      setOpen(false);
                    }}
                    className="flex"
                  >
                    <p className="truncate">
                      {option.localName ? (
                        <>
                          {option.localName}
                          <span className="text-xs text-muted-foreground">
                            {"  " + option.shortName}
                          </span>
                        </>
                      ) : (
                        option.shortName
                      )}
                    </p>{" "}
                    <Check
                      className={cn(
                        "ml-auto h-3 w-3",
                        voice?.shortName === option.shortName
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
