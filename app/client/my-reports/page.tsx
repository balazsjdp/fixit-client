import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ArrowRight,
  Calendar,
  Forward,
  Plug,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export default function MyReports() {
  return (
    <>
      <main>
        <div className="mb-10 flex flex-row justify-between items-center">
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
              Bejelentett hibáim
            </h1>
            <p className="text-lg text-muted-foreground">
              Kövesse nyomon folyamatban lévő és lezárt szerviz igényeit.
            </p>
          </div>
          <Link
            className="bg-primary hover:bg-primary/90 text-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            href="/client/new"
          >
            <Plus className="text-xl" />
            Új hiba bejelentése
          </Link>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  <Wrench className="text-sm" /> Vízvezeték
                </Badge>

                <Badge variant="default">Folyamatban</Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate mb-1">
                Csöpögő csap a konyhában
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={15} />
                Bejelentve: 2024. Március 12.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Szakember
                </p>
                <p className="text-sm font-semibold">Kovács Antal</p>
              </div>
              <Link
                className="flex items-center justify-center"
                href="/client/my-reports/1"
                passHref
              >
                Részletek <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
