## Funkciók
- Kliens bekérdez, szeretne pixelt -> kap egyet
- Onnantól az a kliens folyamatosan küld szín-session párosokat
- ezt addig amíg elfogy a pixel
- ha már nincs akkor elindul egy újraosztás timer, és az újonnan bejövőknek a hátralevő időt mondjuk
- újraosztásnál a legrégebb óta pixellel rendelkező emberektől vesszük el, randomizálva
- régiek akkor tudnak róla, ha elveszik tőlük, akkor kapnak időt

- újraosztás configból jön
- session-ök tárolására db, mellé hogy mióta van pixele
- cookie-ban tárolunk egy uuid-t, amit küld mindig

- Elején csak ablakok, ha elfogy akkor negyedelünk, random megy a kiosztás és a negyedelés is
- Az üres ablakok legyenek randomok

- Kliens x idő inaktivitás után feldob egy ablakot, amit le kell okézni, és akkor szól a szervernek hogy mizu
- Ajánlott kép, menjen le pixel a kliensnek

- Lehessen belenyúlni adminnak: funkciók:
	- Reset, újraosztás, kapcsolatokat nem dobjuk
	- ajánlott képeket adminon lehessen állítani
	- újraosztási idő módosítása
	- adatokat lehessen lekérni a sorról és az embermennyiségről
	- az admin azt csinálja, hogy rest bekérdez, és a szerver ezt konfigurációként értelmezi
	- lesz alap felület, key-el lehet hozzáférni
