import { CategorySelector } from "@/components/features/category-selector";
import { Slider } from "@/components/ui/slider";

export default function Client() {
  return (
    <>
      <main>
        <div className="mb-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
            Hiba bejelentése
          </h1>
          <p className="text-lg text-muted-foreground">
            Írja le a problémát, és mi keresünk Önnek egy közeli szakembert.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-10">
            <section>
              <CategorySelector />
            </section>
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
                2. Fotók a hibáról
              </h3>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 bg-gray-50 dark:bg-gray-800/50 group cursor-pointer hover:border-primary/50 transition-all">
                <span className="material-symbols-outlined text-5xl text-gray-400 mb-3 group-hover:text-primary transition-colors">
                  add_a_photo
                </span>
                <p className="text-base font-semibold text-[#101418] dark:text-white">
                  Kattintson vagy húzza ide a képeket
                </p>
                <p className="text-sm text-[#5e758d] mt-1">
                  PNG, JPG formátum maximum 10MB
                </p>
              </div>
            </section>
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
                3. Hiba részletei
              </h3>
              <textarea
                className="w-full min-h-[150px] p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Kérjük, fejtse ki a hibát részletesen (pl. A konyhai mosogató alatti cső szivárog, amikor folyik a víz...)"
              ></textarea>
            </section>
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5">
                3. Sürgősségi szint
              </h3>
              <div className="bg-primary/5 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                    VÁLASZTOTT: MA
                  </span>
                </div>
                <Slider
                  defaultValue={[50]}
                  max={100}
                  step={50}
                  className="mx-auto w-full cursor-pointer"
                />
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Ma
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    48 Óra
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Rugalmas
                  </span>
                </div>
              </div>
            </section>
            <section>
              <h3 className="dark:text-white text-sm font-bold uppercase tracking-wider mb-5">
                4. HELYSZÍN MEGADÁSA
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-muted-foreground">
                    Pontos cím megadása
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      location_on
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                      id="address"
                      placeholder="Példa: 2085 Pilisvörösvár, Fő út 12."
                      type="text"
                    />
                  </div>
                  <p className="text-xs flex gap-2 mt-1 items-center text-muted-foreground">
                    <span className="material-symbols-outlined text-sm text-primary">
                      info
                    </span>
                    A pontos cím segít a szakembereknek a távolság és az
                    útiköltség kiszámításában.
                  </p>
                </div>
              </div>
            </section>
            <section>
              <button className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-xl font-bold text-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] cursor-pointer">
                <span className="material-symbols-outlined">send</span>
                Probléma beküldése
              </button>
              <p className="text-center text-xs text-gray-400 mt-8 max-w-lg mx-auto">
                Az gombra kattintva elfogadja az általános szerződési
                feltételeket, és lehetővé teszi a helyi szakemberek számára a
                kérés részleteinek megtekintését.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
