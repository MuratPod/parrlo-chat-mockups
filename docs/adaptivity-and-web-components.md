# Parrlo Chat: адаптивность макетов и список компонентов для веб-версии

Дата: 28.10.2026 · автор: Parrlo Design (менеджер по дизайну Мурата) · статус: **черновик для обсуждения; ничего не утверждено**.

Источник: свежий клон `MuratPod/parrlo-chat-mockups`, коммит `83159db` (28.10.2026 01:00 по Мадриду, «Пакет B…»). Сверка с рабочей копией дизайн-папки: её SPEC.md/COMPONENTS.md/components.css старее клона (398 против 615 строк SPEC), поэтому за основу взяты файлы клона; из рабочей копии использованы только скрипты `src/checks.py` и `src/shoot.mjs`.

## 0. Кратко

- В manifest.json: **136 экранов** × 3 языка = **6993 кадров** (RU/ES/EN идентичны по составу; расхождений нет). Из них 3 «листа/сайт» (`states`, `states2`, `hero`) не оценивались как экраны приложения: **133 экранов приложения**.
- Каждый кадр из manifest есть в живом HTML (`frames/*.html`): совпадение по `data-id` 6993 из 6993. PNG есть для всех кадров, кроме 1071 (357 на язык) в пакетах B и D, где SPEC (B.3, D.1) прямо заявляет, что опубликован только набор SE/Pro n+AX5, планшет n, 1280 n и т. д.; для остальных пакетов PNG полные.
- Автоматические DOM-проверки из `shoot.mjs` (слово шире строки, за краем, блок за краем, горизонтальный скролл, тап ≥ 44, текст/кнопка в зоне камеры/сгиба) я перезапустил на всех 6993 кадрах: **0 нарушений**, как и заявлено в SPEC. Это *не* означает, что замечаний нет: проверка не видит многое из перечисленного ниже (см. §3).
- **Экранов с замечаниями по адаптивности: 90 из 133** (дефекты макетов: Duo, полураскрытый вид, ширина плашек, отсутствующие кадры). Ещё **13** экранов без дефектов, но с замечанием «нет десктопной раскладки» (R3, вопрос к менеджеру). Всего экранов хотя бы с одним замечанием: **103**.
- Главные проблемы: (1) в закрытом Duo, раскрытом ландшафте-hl и закрытом ландшафте у **51 экрана нет кнопки «Назад»** (рейка пустая); (2) в закрытом Duo **21 диалог** смещён: центрируется по всему кадру, а не по безопасной области, и залезает на рейку (≈31 pt) и в зарезервированную зону камеры (84×174); (3) на 1280/1440 **78 экранов** (настройки, звонки, поиск, профиль, группы) остаются телефонной колонкой 480 по центру без боковой навигации и master–detail; (4) плашка группы и карточка лимита тянутся на всю панель (895–1440 px), тогда как лента и поле — колонка 720; (5) в полураскрытом портрете у 10 экранов пустая верхняя половина (~270 pt) и 6 экранов с обрезанной строкой/пузырём на сгибе; (6) нет кадров: `voice-18` на 1280/ландшафт/hp/hl и `call` на SE/1280.

## 1. Как проверялось (и что не проверено)

Всё в Chromium (Playwright), живые кадры `frames/{ru,es,en}-*.html` открывались как файлы из клона; рабочая папка результатов — отдельная временная (общую папку проверок не трогал). Клон не изменялся. Мои скрипты в репозиторий не публикуются. `checkFn` из `shoot.mjs` использован без правок.

| Что | Как | Охват |
|---|---|---|
| Наличие кадров | manifest.json × `data-id` в HTML × файлы `png/<язык>/<экран>/<устройство>-<размер>.png` | все 6993 кадра, 3 языка |
| DOM-проверки `shoot.mjs` | `checkFn` без правок; повтор с `.pc-onb-scroll{overflow:visible}` (см. ниже) | все кадры, 3 языка: 0 нарушений |
| Раскладка: число панелей, ширины колонки, плашек, строк, кнопок | `getBoundingClientRect` по DOM каждого кадра | все кадры, 3 языка |
| Duo: рейка, зона камеры, диалоги, сгиб | прямоугольники DOM против `data-res` (зоны из SPEC §8) | все Duo-кадры, 3 языка (диалоги и «Назад»: RU, ES/EN по «Назад» совпали) |
| Визуальная проверка | открыты PNG: `settings/duoc-n`, `settings/duohl-n`, `settings/duohp-n`, `ob-language/duoc-n`, `call-notice/duoc-n`, `reminder-consent/duoc-n`, `settings-account-logout/duohp-n`, `chat-tr-off/duohp-n`, `group-limit/duohp-n`, `calls/d13-n`, `chat/d14-n`, `group-limit-inline/d13-n`, `call/d14-n`, `group-call/d14-n`, `call-limit/d14-n`, `err-send/d13-ax5`, `group-join-done/d13-n` (RU) | выборочно, не все |
| Не заявленные размеры (600, 1024, 1920) | на кадре `d14-n` (или `tab-n`) подменён `--W/--H`, затем те же проверки | 130 экранов, только RU |

**Не проверено:** iPhone/Duo на устройстве, VoiceOver и Dynamic Type, реальные браузеры (WebKit/Safari на машине не запускается; Firefox не запускал), реальное поведение клавиатуры/фокуса (в макетах статический HTML без скриптов: `tabindex` — 0, `<input>`/`<textarea>`/`<form>` — 0), анимации, ES/EN для проверок диалогов Duo (диалоги мерил только на RU: ширина 360 и `left:50%` не зависят от языка), PNG ES/EN визуально. Проверки двух- и одноколоночных раскладок — по DOM и выборочно по PNG, не по каждому PNG.

**Замечание к инструменту проверок.** В hp/hl `.pc-onb-scroll` получает `display:contents`, поэтому `getBoundingClientRect()` возвращает нули (я получил `0×0` на y=−9381), а `checkFn` отсекает текст «по клипу» контейнера и **пропускает его**. Я перезапустил проверки с `overflow:visible` для этого контейнера: нарушений по-прежнему 0, но «0 нарушений» в hp/hl для экранов на шаблоне `.pc-onb` (ок. 100 экранов) до этого не было надёжным доказательством. Рекомендация: поправить условие клипа в `shoot.mjs` (пропускать предков с `display:contents`).

## 2. Покрытие кадров: заявлено и фактически

Заявлено в SPEC §4 (таблица устройств): SE/Pro — normal, XL, AX5; планшет — normal, AX5; 1280 — normal, AX5; 1440 — normal; Duo закрыт/раскрыт портрет — normal, AX5; раскрыт ландшафт, hp, hl — normal. Фактически по manifest:

| Пакет | Экранов | Кадров на язык | PNG на язык (есть/кадров) | Состав кадров (устройство:размеры) → экранов |
|---|---|---|---|---|
| Фаза 1 (онбординг, главная, звонок) | 12 | 196 | 196/196 | 9× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n]<br>1× [SE:n/xl/ax5; Pro:n/xl/ax5; Duo закр.:n/ax5]<br>1× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5]<br>1× [Pro:n/xl/ax5; Планшет:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n] |
| Фаза 2 + §12 (чат, группа, звонок, лимиты, память) | 20 | 331 | 331/331 | 19× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1440:n/ax5; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n]<br>1× [SE:n/xl/ax5; Pro:n/xl/ax5; Duo закр.:n/ax5] |
| §13 вход и настройка Парло | 7 | 126 | 126/126 | 7× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n] |
| §14 пустые состояния, ошибки, преемник | 13 | 224 | 224/224 | 12× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n]<br>1× [SE:n/xl/ax5; Pro:n/xl/ax5; Duo закр.:n/ax5] |
| Пакет A: настройки | 13 | 234 | 234/234 | 13× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n] |
| Пакет C: поиск и звонки | 18 | 324 | 324/324 | 18× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n] |
| Пакет D: состояния после решений | 21 | 368 | 185/368 | 20× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n]<br>1× [SE:n/xl/ax5; Pro:n/xl/ax5; Duo закр.:n/ax5] |
| Пакет B: профиль, группа, права | 29 | 522 | 348/522 | 29× [SE:n/xl/ax5; Pro:n/xl/ax5; Планшет:n/ax5; 1280:n/ax5; 1440:n; Duo закр.:n/ax5; Duo раскр. п.:n/ax5; Duo раскр. л.:n; Duo hp:n; Duo hl:n] |

Обозначения размеров: n = normal, xl = XL, ax5 = AX5. Листы `states`, `states2` (1180×1400/1700) и `hero` (сайт, 1440 n/AX5 и Pro n/AX5, высота авто) — не устройства приложения.

Отклонения от заявленного (каждый пункт проверен по manifest и файлам):

| № | Что | Где | Статус |
|---|---|---|---|
| К1 | Нет кадров 1280 (n/AX5), ландшафта раскрытого, hp, hl | `voice-18` (есть SE, Pro, планшет, 1440, Duo закр./раскр. п.) | **замечание R9**: SPEC §4 заявляет все устройства |
| К2 | Нет SE (n/XL/AX5) и 1280 (n/AX5) | `call` (есть Pro, планшет, 1440 n, Duo все позы) | **замечание R9** |
| К3 | Только compact (SE, Pro, Duo закрыт) | `parrlo`, `empty-protocol`, `call-protocol`, `call-protocol-delete` | по дизайну: SPEC §4 (`parrlo` «только compact»), COMPONENTS 5.13 (`call-protocol`); для `empty-protocol` и `call-protocol-delete` явного указания нет — вывод по факту, **уточнить**. На 1440 протокол показан панелью в `call` |
| К4 | Для 19 экранов фазы 2 вместо 1280 есть только **1440 (n и AX5)** | `parrlo-voice`, `draft`, `draft-edit`, `chat`, `stranger`, `group`, `group-limit`, `call-notice`, `call-notice-guest`, `usage`, `usage-limit`, `plans`, `reminder`, `memory`, `memory-delete`, `memory-off`, `group-call`, `group-call-limit`, `call-limit` | по COMPONENTS 5.13 так и заявлено (десктоп 1440 n/AX5), но **SPEC §4 заявляет 1280 n/AX5 и 1440 только n**: документы расходятся; 1280 для этих экранов и 1440 AX5 для остальных экранов не нарисованы |
| К5 | XL у планшета/десктопа/Duo не рисуется | везде | по SPEC: XL только SE/Pro |
| К6 | `-full.png` (вся высота SE/Pro при AX5) есть только у 18 экранов пакета C | `png/ru/calls/pro-ax5-full.png` и др.; у `ob-consent` и остальных их нет | SPEC §4 обещает `-full` для SE/Pro AX5 и для согласия; SPEC §11.7 пишет «`*-full.png` не публикуются» — **документы противоречат друг другу и репозиторию** |
| К7 | `-ann.png` (зоны камеры/сгиба) нет у 50 экранов с опубликованными Duo-PNG (пакеты B, D и ряд экранов других) | `png/ru/reminder-consent/duoc-n-ann.png` есть, `png/ru/group-members/duoc-n-ann.png` нет | информативно: аннотации в SPEC для этих пакетов не заявлены |
| К8 | Индекс `index.html` | — | ок: 7707 PNG на диске = 7707 в списке индекса, все 136 экранов доступны |

## 3. Замечания по адаптивности (легенда к таблице)

| Код | Устройства | Суть (проверено) | Экранов | Примеры (RU; ES/EN — те же пути с `png/es`, `png/en`) | Статус |
|---|---|---|---|---|---|
| R1 | Duo закрыт (n, AX5) | Диалог `.pc-alert` стоит на `left:50%` всего кадра (466), а не безопасной области (382): в закрытом Duo он занимает x=53…413, то есть заходит на правую рейку (≈31 pt) и верхним правым углом (y≥82) в зарезервированную зону камеры 84×174 (x≥382, y<174). Тексты и кнопки в зону не попадают, поэтому `fold`-проверка молчит. У hp/hl диалог переставлен в одну половину (`data-pose`), у рейки (duoc/duool) — нет. | 21 | `png/ru/reminder-consent/duoc-n.png`, `png/ru/ob-parrlo-setup-skip/duoc-n.png`, `png/ru/settings-account-logout/duoc-n.png`, `…/duoc-ax5.png` | замечание |
| R2 | Duo закрыт, раскрыт ландшафт-hl, закрытый ландшафт `duool` | В кадре **нет кнопки «Назад»** (на Pro она есть): рейка пустая, в шапке её нет. SPEC §8 п.1 обещает, что «Назад» уходит на рейку; в `ob-language`, `ob-age` и др. так и сделано, а на этих экранах — нет. На планшете/раскрытом/hp «Назад» на месте. Проверка по `aria-label` «Назад/Atrás/Back», совпала на RU/ES/EN, учтены n и AX5. | 51 | нет: `png/ru/settings/duoc-n.png`, `png/ru/settings/duohl-n.png`, `png/ru/call-notice/duoc-n.png`; есть для сравнения: `png/ru/ob-language/duoc-n.png` | замечание (серьёзное: не выйти с экрана) |
| R3 | 1280, 1440 (и в меньшей степени планшет/Duo раскрыт) | Экран построен на колонке онбординга: на 1280/1440 колонка 480 по центру (≈63–67 % ширины пусто), «Назад» остаётся в шапке колонки, боковой навигации/списка нет, нет master–detail (настройки, звонки, поиск, контакт, группы, лимиты). Растянутости нет (`max-width` есть), это отсутствие широкой раскладки. SPEC C.3 фиксирует колонку 440/480 как решение; для веба решение не принято. На `tab`/`duoo` колонка 440 на 834/669 (47–34 % пусто), приемлемо. Не считаю для `ob-*` и `voice-18`: центрированная колонка для онбординга ожидаема. | 78 | `png/ru/calls/d13-n.png`, `png/ru/settings/d14-n.png`, `png/ru/group-members/d13-n.png` | вопрос менеджеру/Мурату |
| R4 | 1280, 1440 (n, AX5); 1920 в доп. проверке | Плашка ИИ группы `.pc-grpai` и баннер звонка тянутся на всю панель (895 на 1280, 1019 на 1440, 1080 в звонке 1440; на AX5 1280/1440), карточка лимита `.pc-lcard` в звонке — 1048 (1408 на AX5), а лента и поле ввода — колонка 720. Края не совпадают; в `group-limit-inline` строка лимита идёт одной строкой 691–757 px (RU/ES/EN, ~90 знаков). На 1920 плашка 1499–1560 px. | 10 | `png/ru/group-limit-inline/d13-n.png`, `png/ru/group/d14-n.png`, `png/ru/call-limit/d14-n.png`, `png/ru/group-call/d14-n.png` | замечание (минор) |
| R7 | Duo hp | Верхняя половина (373,5 pt) пустая: после заголовка ~270 pt пустоты до сгиба, весь контент (до 5–6 строк) в нижней области ≈422 pt; список/форма скроллится. Диалоги исключены из подсчёта. | 10 | `png/ru/settings/duohp-n.png`, `png/ru/search-home-results/duohp-n.png` | замечание (минор), решение по позе hp — допущение SPEC §8 |
| R8 | Duo hp | Пузырь сообщения пересекает полосу сгиба 40 pt (метрика; текст в полосу не попал) на 4 экранах; в `chat-tr-off`/`group-limit` блок обрезан шапкой/баннером: видно «Включить перевод», но не текст плашки; у лимита закрыта верхняя часть карточки. `chat-tr-sheet-off` — по метрике (пересечение 62 px), PNG не смотрел. Нижняя половина 422 pt не вмещает шапку + плашки + карточку + поле. | 6 | `png/ru/chat-tr-off/duohp-n.png`, `png/ru/group-limit/duohp-n.png`, `png/ru/search-chat/duohp-n.png` | замечание |
| R9 | разные | Нет заявленных кадров (см. К1, К2). | 2 | — | замечание |

**Проверено и замечаний нет:**

- Растяжение контента на планшете (834) и Duo раскрытом (669/951): при обычном размере текста плашки и строки списков ≤ 546 px, строки текста ≤ 506 px; плашки шире (834) бывают только в одно-панельных AX5-кадрах, где панели схлопнуты. На 1280/1440 в обычном размере строки текста ≤ 757 px (максимум в `group-limit-inline`, длиннее остальных); в AX5 строки плашек группы доходят до 968–1243 px, но это ≈67 знаков при шрифте ×2,5 — по числу знаков нормально.
- На 1280/1440 кнопки ≤ 720 (кроме AX5: колонка растёт с `--ts-i`, кнопка до 672) и строки ≤ 432–720; переписка в колонке `--content-max` 720. Панели списка 384 (1280) и 420 (1440), деталь 896/1020.
- Диалоги на десктопе/планшете центрированы по 360 со скримом, меню быстрых действий — поповер 300 слева у дока (без скрима, как в COMPONENTS 1.7). `fold`-проверка по камере/сгибу: 0.
- Схлопывание XL/AX5 в одну панель на любой ширине (решено менеджером, SPEC §10): подтверждено — на 1280 AX5 `panes=1` (1280), на планшете 834, на 1440 — 1440. Для веба это означает «потерю списка чатов при увеличенном шрифте» (см. часть 2).

### Не заявленные размеры (моя доп. проверка, только RU, 130 экранов; не результат из SPEC)

| Ширина | Что получилось |
|---|---|
| 599×900 | compact: одна колонка, нарушений DOM-проверок нет |
| 600×900 | сразу две панели: список 320 + деталь **280** (33 двухпанельных экрана). В `chat` три слова («Протокол», «звонка», «Расшифровка») шире строки карточки протокола (80/57/87 px при строке 46) → проверка `word` падает; весь остальной ряд 600–833 в макетах не показан. Рекомендация: порог двух панелей для веба ≥ 840 или список 280 + деталь ≥ 480 (решение менеджера) |
| 1024×768 | список 384 + деталь 640; нарушений нет (кроме `hero`, сайт) |
| 1920×1080 | список 420 + деталь 1500; колонка ленты 720, плашки (R4) 1499–1560 px; одноколоночные экраны так и остаются колонкой 480 (на 1920 это ≈75 % пустого экрана) |

## 4. Таблица экран × устройство × статус

Знаки: **ок** = кадр есть в manifest, DOM-проверки 0 нарушений, моих замечаний нет; **Rn** = замечание из §3 (на любом из размеров текста этого устройства); **—** = кадра нет по дизайну или заявке; **✗R9** = заявленного кадра нет. Колонка «PNG» — путь-пример для первого замечания (RU), если PNG опубликован; иначе — живой HTML `frames/ru-<экран>.html` (указано «HTML»). `states`, `states2`, `hero` — не оценивались как экраны (листы состояний/сайт).

| Экран | Пакет | SE | Pro | Планшет | 1280 | 1440 | Duo закр. | Duo раскр. п. | Duo раскр. л. | Duo hp | Duo hl | PNG-пример |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `ob-welcome` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-language` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-signin` | П1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-signin-wait` | П1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-signin-cancel` | П1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-signin-offline` | П1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-age` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-age-under` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-consent` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-consent-no` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-parrlo-setup` | П1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-parrlo-setup-error` | П1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `ob-parrlo-setup-skip` | П1 | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/ob-parrlo-setup-skip/duoc-n.png` |
| `home-empty` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `home-chats` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `home-menu` | Ф1 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `parrlo` | Ф1 | ок | ок | — | — | — | ок | — | — | — | — |  |
| `voice-18` | Ф1 | ок | ок | ок | ✗R9 | ок | R2 | ок | ✗R9 | ✗R9 | ✗R9 | `png/ru/voice-18/duoc-n.png` |
| `call` | Ф1 | ✗R9 | ок | ок | ✗R9 | ок | ок | ок | ок | ок | ок |  |
| `group-successor` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-successor/duoc-n.png` |
| `group-successor-confirm` | П2 | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/group-successor-confirm/duoc-n.png` |
| `group-successor-error` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-successor-error/duoc-n.png` |
| `group-successor-delete` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-successor-delete/duoc-n.png` |
| `err-offline-banner` | П2 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `err-offline-full` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/err-offline-full/duoc-n.png` |
| `err-send` | П2 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `empty-contacts` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | R7 | R2 | `png/ru/empty-contacts/duoc-n.png` |
| `empty-group` | П2 | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `empty-protocol` | П2 | ок | ок | — | — | — | ок | — | — | — | — |  |
| `empty-memory` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/empty-memory/duoc-n.png` |
| `empty-search` | П2 | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/empty-search/duoc-n.png` |
| `reminder-consent` | П2 | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/reminder-consent/duoc-n.png` |
| `settings` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | R7 | R2 | `png/ru/settings/duoc-n.png` |
| `settings-parrlo` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/settings-parrlo/duoc-n.png` |
| `settings-parrlo-more` | A | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/settings-parrlo-more/duoc-n.png` |
| `settings-account-deleted` | A | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/settings-account-deleted/d13-n.png` |
| `settings-language` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | R7 | R2 | `png/ru/settings-language/duoc-n.png` |
| `settings-about` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | R7 | R2 | `png/ru/settings-about/duoc-n.png` |
| `parrlo-voice` | Ф2 | ок | ок | ок | — | ок | ок | ок | ок | ок | ок |  |
| `draft` | Ф2 | ок | ок | ок | — | ок | ок | ок | ок | ок | ок |  |
| `draft-edit` | Ф2 | ок | ок | ок | — | ок | ок | ок | ок | ок | ок |  |
| `chat` | Ф2 | ок | ок | ок | — | ок | ок | ок | ок | ок | ок |  |
| `stranger` | Ф2 | ок | ок | ок | — | ок | ок | ок | ок | ок | ок |  |
| `call-notice` | Ф2 | ок | ок | ок | — | R3 | R2 | ок | R2 | ок | R2 | `png/ru/call-notice/duoc-n.png` |
| `call-protocol` | Ф2 | ок | ок | — | — | — | ок | — | — | — | — |  |
| `group` | Ф2 | ок | ок | ок | — | R4 | ок | ок | ок | ок | ок | `png/ru/group/d14-n.png` |
| `group-call` | Ф2 | ок | ок | ок | — | R4 | ок | ок | ок | ок | ок | `png/ru/group-call/d14-n.png` |
| `usage` | Ф2 | ок | ок | ок | — | R3 | R2 | ок | R2 | ок | R2 | `png/ru/usage/duoc-n.png` |
| `usage-limit` | Ф2 | ок | ок | ок | — | R3 | R2 | ок | R2 | ок | R2 | `png/ru/usage-limit/duoc-n.png` |
| `plans` | Ф2 | ок | ок | ок | — | R3 | R2 | ок | R2 | ок | R2 | `png/ru/plans/duoc-n.png` |
| `reminder` | Ф2 | ок | ок | ок | — | ок | R1 | ок | ок | ок | ок | `png/ru/reminder/duoc-n.png` |
| `memory` | Ф2 | ок | ок | ок | — | R3 | R2 | ок | R2 | ок | R2 | `png/ru/memory/duoc-n.png` |
| `memory-delete` | Ф2 | ок | ок | ок | — | R3 | R1 | ок | ок | ок | ок | `png/ru/memory-delete/duoc-n.png` |
| `group-limit` | Ф2 | ок | ок | ок | — | R4 | ок | ок | ок | R8 | ок | `png/ru/group-limit/duohp-n.png` |
| `call-limit` | Ф2 | ок | ок | ок | — | R4 | ок | ок | ок | ок | ок | `png/ru/call-limit/d14-n.png` |
| `group-call-limit` | Ф2 | ок | ок | ок | — | R4 | ок | ок | ок | ок | ок | `png/ru/group-call-limit/d14-n.png` |
| `call-notice-guest` | Ф2 | ок | ок | ок | — | R3 | R2 | ок | R2 | ок | R2 | `png/ru/call-notice-guest/duoc-n.png` |
| `memory-off` | Ф2 | ок | ок | ок | — | R3 | R1 | ок | ок | ок | ок | `png/ru/memory-off/duoc-n.png` |
| `hero` | Ф1 | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | |
| `states` | Ф1 | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | |
| `states2` | Ф2 | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | не оценивался | |
| `settings-account` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | R7 | R2 | `png/ru/settings-account/duoc-n.png` |
| `settings-account-delete` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/settings-account-delete/duoc-n.png` |
| `settings-account-delete-confirm` | A | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/settings-account-delete-confirm/duoc-n.png` |
| `settings-account-delete-error` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/settings-account-delete-error/duoc-n.png` |
| `settings-account-logout` | A | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/settings-account-logout/duoc-n.png` |
| `settings-account-logout-web` | A | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/settings-account-logout-web/duoc-n.png` |
| `settings-notifications` | A | ок | ок | ок | R3 | R3 | R2 | ок | R2 | R7 | R2 | `png/ru/settings-notifications/duoc-n.png` |
| `search-home` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | R7 | ок | `png/ru/search-home/duohp-n.png` |
| `search-home-results` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | R7 | ок | `png/ru/search-home-results/duohp-n.png` |
| `search-home-loading` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | R7 | ок | `png/ru/search-home-loading/duohp-n.png` |
| `search-home-error` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | R7 | ок | `png/ru/search-home-error/duohp-n.png` |
| `search-chat` | C | ок | ок | ок | ок | ок | ок | ок | ок | R8 | ок | `png/ru/search-chat/duohp-n.png` |
| `search-chat-empty` | C | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `calls` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/calls/d13-n.png` |
| `calls-missed` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/calls-missed/d13-n.png` |
| `calls-empty` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/calls-empty/d13-n.png` |
| `calls-loading` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/calls-loading/d13-n.png` |
| `calls-error` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/calls-error/d13-n.png` |
| `call-detail` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/call-detail/d13-n.png` |
| `call-detail-missed` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/call-detail-missed/d13-n.png` |
| `call-detail-group` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/call-detail-group/d13-n.png` |
| `contact` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/contact/d13-n.png` |
| `call-connecting` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/call-connecting/d13-n.png` |
| `call-noanswer` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/call-noanswer/d13-n.png` |
| `call-failed` | C | ок | ок | ок | R3 | R3 | ок | ок | ок | ок | ок | `png/ru/call-failed/d13-n.png` |
| `usage-reset` | D | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/usage-reset/duoc-n.png` |
| `usage-limit-week` | D | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/usage-limit-week/duoc-n.png` |
| `call-notice-again` | D | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/call-notice-again/duoc-n.png` |
| `call-guest-declined` | D | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/call-guest-declined/duoc-n.png` |
| `call-guest-end` | D | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/call-guest-end/duoc-n.png` |
| `call-guest-end-sent` | D | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/call-guest-end-sent/duoc-n.png` |
| `limit-err-parrlo` | D | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/limit-err-parrlo/duoc-n.png` |
| `limit-err-week` | D | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/limit-err-week/duoc-n.png` |
| `limit-err-call` | D | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/limit-err-call/duoc-n.png` |
| `limit-err-group-call` | D | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/limit-err-group-call/duoc-n.png` |
| `group-limit-inline` | D | ок | ок | ок | R4 | R4 | ок | ок | ок | R8 | ок | `png/ru/group-limit-inline/duohp-n.png` |
| `chat-tr-on` | D | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `chat-tr-off` | D | ок | ок | ок | ок | ок | ок | ок | ок | R8 | ок | `png/ru/chat-tr-off/duohp-n.png` |
| `chat-tr-sheet` | D | ок | ок | ок | ок | ок | R1 | ок | ок | ок | ок | `png/ru/chat-tr-sheet/duoc-n.png` |
| `chat-tr-sheet-off` | D | ок | ок | ок | ок | ок | R1 | ок | ок | R8 | ок | `png/ru/chat-tr-sheet-off/duoc-n.png` |
| `home-reminder` | D | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `home-reminder-closed` | D | ок | ок | ок | ок | ок | ок | ок | ок | ок | ок |  |
| `group-admin-changed` | D | ок | ок | ок | R4 | R4 | ок | ок | ок | ок | ок | `png/ru/group-admin-changed/d13-n.png` |
| `group-admin-you` | D | ок | ок | ок | R4 | R4 | ок | ок | ок | ок | ок | `png/ru/group-admin-you/d13-n.png` |
| `call-protocol-delete` | D | ок | ок | — | — | — | R1 | — | — | — | — | `png/ru/call-protocol-delete/duoc-n.png` |
| `call-protocol-deleted` | D | ок | ок | ок | ок | ок | ок | ок | ок | R8 | ок | `png/ru/call-protocol-deleted/duohp-n.png` |
| `contact-profile` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/contact-profile/duoc-n.png` |
| `contact-nogroups` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/contact-nogroups/duoc-n.png` |
| `contact-block` | B | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/contact-block/duoc-n.png` |
| `contact-blocked` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/contact-blocked/duoc-n.png` |
| `contact-loading` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/contact-loading/duoc-n.png` |
| `contact-error` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/contact-error/duoc-n.png` |
| `group-parrlo` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-parrlo/duoc-n.png` |
| `group-parrlo-member` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-parrlo-member/duoc-n.png` |
| `group-parrlo-off` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-parrlo-off/duoc-n.png` |
| `group-parrlo-error` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-parrlo-error/duoc-n.png` |
| `group-ai-info` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-ai-info/duoc-n.png` |
| `group-members` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-members/duoc-n.png` |
| `group-members-menu` | B | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/group-members-menu/duoc-n.png` |
| `group-members-remove` | B | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/group-members-remove/duoc-n.png` |
| `group-members-member` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-members-member/duoc-n.png` |
| `group-members-empty` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-members-empty/duoc-n.png` |
| `group-members-loading` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-members-loading/duoc-n.png` |
| `group-members-error` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-members-error/duoc-n.png` |
| `admin-transfer` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/admin-transfer/duoc-n.png` |
| `admin-transfer-confirm` | B | ок | ок | ок | R3 | R3 | R1 | ок | ок | ок | ок | `png/ru/admin-transfer-confirm/duoc-n.png` |
| `admin-transfer-wait` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/admin-transfer-wait/duoc-n.png` |
| `admin-transfer-error` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/admin-transfer-error/duoc-n.png` |
| `admin-transfer-done` | B | ок | ок | ок | R4 | R4 | ок | ок | ок | ок | ок | `png/ru/admin-transfer-done/d13-n.png` |
| `group-join` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-join/duoc-n.png` |
| `group-join-wait` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-join-wait/duoc-n.png` |
| `group-join-error` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-join-error/duoc-n.png` |
| `group-join-invalid` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-join-invalid/duoc-n.png` |
| `group-join-declined` | B | ок | ок | ок | R3 | R3 | R2 | ок | R2 | ок | R2 | `png/ru/group-join-declined/duoc-n.png` |
| `group-join-done` | B | ок | ок | ок | R4 | R4 | ок | ок | ок | ок | ок | `png/ru/group-join-done/d13-n.png` |

Сводка по таблице: R1: 21 экр.; R2: 51 экр.; R3: 78 экр.; R4: 10 экр.; R7: 10 экр.; R8: 6 экр.; R9: 2 экр.. Экранов с дефектами (R1, R2, R4, R7, R8, R9): 90; только с R3: 13; без замечаний: 30 (из них `ob-*` и двухпанельные экраны без Duo-замечаний).

## 5. Компоненты для веб-версии

Источники: `COMPONENTS.md` (разделы 0–5.19), `components.css`, `components-c.css`, `tokens.css`, HTML-кадры. «Где используется» — число экранов RU, где класс встречается в разметке кадров (пересчитано по `frames/ru-*.html`). Столбец «Чего не хватает для веба» — только то, что я проверил в CSS/разметке или что прямо отсутствует в документах; домыслов нет. **«Не утверждено»** — по SPEC/COMPONENTS (плашка `.pc-tbd`) либо мой вывод, который требует решения (отмечено «реш.»).

### 5.0 Что общее для всех компонентов (проверено по CSS и разметке)

| Тема | Факт | Что нужно для веба |
|---|---|---|
| Токены | `tokens.css`: цвета, отступы (сетка 4), радиусы 6/8/12/20/28/pill, размеры (тап 44, кнопка 56, аватар 56/112/168), типографика Inter + Nunito 900 (wordmark), движение 120/220 мс. Только тёмная тема (`color-scheme:dark`) | Решение: нужна ли светлая тема/`prefers-color-scheme` (реш.); `prefers-contrast`, `forced-colors` — 0 вхождений в CSS |
| Брейкпоинты | `@container` по корню: compact < 600, regular ≥ 600, wide ≥ 1024, xwide ≥ 1360. В CSS `@media` только один — `prefers-reduced-motion` для спиннера | Для веба оставить container queries на корне приложения; добавить min-width окна и порог двух панелей (в моей доп. проверке при 600–833 деталь 280 px — мало) |
| Размер текста | `data-ts=xl/ax5` — множители `--ts-*` (эмуляция Dynamic Type), при XL/AX5 панели схлопываются на любой ширине | В вебе масштаб делает браузер: перевести размеры в `rem`, а схлопывание панелей вывести из ширины окна/zoom (на 1280 при AX5 сейчас пропадает список чатов). Требует решения менеджера: SPEC §10 считает схлопывание «ок» для приложения |
| Hover | Есть `:hover` у `.pc-btn`, `.pc-ibtn`, `.pc-row`, `.pc-radio`, `.pc-check`, `.pc-chip`, `.pc-search`, `.pc-setrow`, `.pc-stage`, `.pc-menu button`. **Нет** у `.pc-me`, `.pc-switch`, `.pc-seg-b`. COMPONENTS §3 обещает «hover только на `@media (hover:hover)`», в CSS таких условий **0** — на тач-экранах hover «залипнет» | Обернуть hover в `@media (hover:hover)`; добавить hover для `.pc-me`, `.pc-switch`, `.pc-seg-b`, `.pc-textarea`/поля |
| Фокус | `:focus-visible` (контур 2 px `--focus`, отступ 3 / −2 внутрь) в 13 правилах, включая кнопки, строки, переключатель, радио, чекбокс, чип, сегмент, поиск. Глобально `:focus{outline:none}`. Имитация состояний — классы `.is-hover/.is-focus` (для листа `states`) | Проверить, что нет «потери фокуса» на элементах без правила: `.pc-textarea`, поле запроса `.q` и `.pc-field` без реального `<input>` |
| Реальные поля | В кадрах **0** `<input>`, `<textarea>`, `<form>`; поля — `div/span role="textbox"` | В вебе — настоящие `input/textarea` (autofill, IME, вставка, выделение), `autocomplete`, `aria-describedby` (0 вхождений) |
| Клавиатура | В документах: Tab-порядок, стрелки в списках (roving tabindex), Esc закрывает поповер/диалог, Enter отправляет, Shift+Enter — перенос, Cmd/Ctrl+Enter — «Готово»; в разметке `tabindex` — 0, скриптов нет | Всё это только описание; нужны фокус-ловушка, возврат фокуса, skip-link, управление стрелками (реализация, не макет) |
| Горячие клавиши | COMPONENTS §3 (**предложение, не утверждено**): Ctrl/Cmd+K — поиск, Ctrl/Cmd+N — новый чат, `/` — фокус в поле Парло. В UI не показаны (`<kbd>`: 0) | Решение Мурата/менеджера: набор, подсказки в UI, конфликты с браузером |
| ARIA | Диалоги — `role="alertdialog"` + `aria-modal` + `inert` для фона (365 вхождений, `role="dialog"` — 0): даже для выбора языка и настроек перевода; `role=status/alert/switch/radiogroup/tablist/search/menu` на месте; `aria-live` у субтитров/диктовки; `<main>`/`<nav>` в кадрах по 4, `role=log`/`list` — 0 | Для диалогов выбора использовать `dialog`, `alertdialog` — только для деструктива и ошибок; ленте сообщений — `role=log`/`feed`; ориентиры (`nav`, `main`, `aside`) |
| Курсор | `button{cursor:pointer}`, `cursor:not-allowed` у disabled; для текстовых полей, неактивных полос, перетаскивания курсоров нет | Добавить `cursor:text`, `default`, `grab` (если появится ресайз панелей) |
| Анимации | `transition` в 3 местах, `scale(.96–.98)` на `:active`; `prefers-reduced-motion` отключает только `.pc-spin` | Отключать и переходы/масштаб; поповер «без анимации размера» уже в документе |
| Ресайз/окна | Контейнерные запросы; ширины панелей фиксированы (320/384/420, колонка 440/480, контент 720, протокол 300/360); нет ручного ресайза, min/max-width окна, сворачивания списка | Решение: минимальная ширина окна, ресайз/сворачивание списка |
| Десктопная навигация | Нет роутинга/URL/истории, нет меню приложения, нет контекстного меню (ПКМ), нет drag&drop, нет вложений, эмодзи, ответа/пересылки, веб-уведомлений: этих экранов нет в SPEC/COMPONENTS (поиск по словам «вложен», «эмодзи», «контекстн», «пересл» — 0) | **Не нарисовано, требует решения** — состав веб-функций определяет менеджер |

### 5.1 Навигация и каркас

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-app`, `.pc-split`, `.pc-pane--list/--detail`, `.pc-pp-bar` | каркас «список | деталь»; шапка детали (назад, аватар, имя, статус, действия) | compact: стек (`data-view=detail`); regular+: две панели; XL/AX5: одна; hp/hl: по обе стороны сгиба | `--list-tablet 320`, `--list-desktop 384`, `--list-wide 420`, `--content-max 720` | 600 / 1024 / 1360 | 35 экр. (`.pc-split`); 33 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | URL/история; ресайз и сворачивание списка; пустая деталь для «чат не выбран» (в кадрах не нашёл); порог 600 даёт деталь 280 px |
| `.pc-bar`, `.pc-me`, `.pc-ibtn` («+», профиль) | верх списка: профиль «МП», «Новый чат» | focus; у `.pc-me` нет hover | 44×44; `--icon-btn` | в Duo закр./ландш. уходят на рейку | `.pc-bar` 34 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | меню профиля (выпадающее) не нарисовано: «МП» открывает Настройки по SPEC §16 |
| `.pc-dock` | низ списка: быстрые действия + поиск; градиент к фону | — | `--dock-btn` 52 | compact и список; поповер `.pc-menu` ≥600 | `.pc-dock` 34 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | в вебе поиск обычно сверху боковой панели; Ctrl/Cmd+K |
| `.pc-onb`, `.pc-onb-col`, `.pc-dots` | шаблон онбординга и (повторно) настроек/звонков/групп: шапка, зона A, тело, действия | шаг активен 22×7 / неактивен 7×7; не кликабельны | колонка `--col-onb 440` / `--col-onb-wide 480` (×`--ts-i`) | ≥600: центр. колонка; ≥1024: 480; hp/hl: сетка 373,5 + 40 (сгиб) | `.pc-onb` 92 экр.: `admin-transfer`, `admin-transfer-confirm`, `admin-transfer-error`… | на десктопе — телефонная колонка (R3); «Назад» без истории браузера |
| `.pc-seg`, `.pc-seg-b` | сегмент «Все / Пропущенные» (`tablist`) | selected (`aria-selected`), focus; **hover нет** | высота ≥ 44, pill | XL/AX5 — колонка | `.pc-seg` 5 экр.: `calls`, `calls-empty`, `calls-error`… | hover; стрелки ←/→ между вкладками (описаны, не проверимы) |
| `.pc-proto`, `.pc-protofull` | панель протокола звонка (справа) / экран протокола (compact) | скрыт по умолчанию, `display:flex` на ≥600 | 300 (1024), **360** (≥1360) | compact: экран; regular+: панель | 4 экр.: `call`, `call-limit`, `group-call`… | закрыть/свернуть панель; ресайз; копирование/экспорт протокола — не нарисованы |
| `.pc-rail` | вертикальная панель Duo справа (Назад, «+», профиль, протокол) | — | 84 px; камера 37×37 | только Duo закрыт/ландшафт | Duo-кадры | **не переносить в веб**; но см. R2 — сам Duo-макет без «Назад» на 51 экране |

**Как перенести в веб:** список чатов → левая боковая панель (384 на ≥1024, 420 на ≥1360; для 840–1023 — 320, ниже двух панелей нет); «Назад» оставить только в compact; нижний док (быстрые действия + поиск) → верх/низ боковой панели; каждый экран получает URL (чат, настройки, звонок); «Настройки», «Звонки», «Поиск» на ≥1024 → не колонка 480, а раздел в боковой панели или центрированное окно 640–720 с левым меню (настройки) либо «список | деталь» (звонки, контакт, участники). Рейка `.pc-rail` — только Duo, на вебе не переносится.

**Не утверждено / решения:** пороги и размеры панелей — допущение дизайна (SPEC §4/§5); колонка 440/480 для настроек/поиска/звонков записана как решение дизайна в SPEC C.3, для веба — **не утверждено**; нужен ответ менеджера: настройки — страница или окно; минимальная ширина окна; ресайз списка.

### 5.2 Списки и строки

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-row`, `.pc-chats`, `.pc-hit` | строка чата, истории звонков, результата поиска | normal, hover (+6 %), pressed (+10 %), focus (контур внутрь), selected (`aria-current`, акц. 14 %), missed (`.is-missed`) | аватар 56, имя 17/500, время 13, превью 15; XL — 2 строки, AX5 — 3 | compact: на всю ширину; regular+: в левой панели | `.pc-row` 37 экр.: `admin-transfer-done`, `call-protocol-deleted`, `calls`… | ПКМ/«⋯»; множественный выбор; roving tabindex (в разметке нет); контекст «непрочитанное» |
| `.pc-setlist`, `.pc-setrow` | строки настроек со значком, подписью, значением, шевроном | normal, hover (фон `--raised`), focus (внутрь), danger (`--setrow--danger`) | иконка 32, значение ≤ 48 % | XL/AX5 — значение под подписью | `.pc-setrow` 19 экр.: `call-detail`, `call-detail-missed`, `contact`… | `aria-haspopup="dialog"` на «Ещё» есть; для веба — master–detail (R3) |
| `.pc-mem`, `.pc-mems`, `.pc-role` | участник группы / запись памяти + роль «Админ/Участник» + «⋯» | `.is-sel` (меню открыто), роль мятная/нейтральная | аватар, кнопка 44×44 | XL/AX5: роль под именем | `.pc-mem` 6 экр.: `group-members`, `group-members-empty`, `group-members-error`… | меню «⋯» → контекстное меню/поповер у курсора; hover |
| `.pc-kv`, `.pc-pkv`, `.pc-plist`, `.pc-lrow` | списки «ключ — значение», участники звонка, строки лимитов | только чтение; XL/AX5 — колонка | значение ≤ 50 % | — | `.pc-pkv` 1 экр.: `group-parrlo-member`; `.pc-lrow` 5 экр.: `states2`, `usage`, `usage-limit`… | выделение/копирование текста; таблица на десктопе |
| `.pc-radio`, `.pc-radios`, `.pc-pers`, `.pc-valrow` | выбор одного (язык, образ Парло, преемник группы) | normal, hover, focus, `aria-checked` | строка ≥ 60, маркер 24 | — | `.pc-radio` 17 экр.: `admin-transfer`, `admin-transfer-confirm`, `admin-transfer-error`… | стрелки ↑/↓ внутри `radiogroup` (описано, не реализовано) |

**Как перенести в веб:** строка чата `.pc-row` и строка настроек `.pc-setrow` сохраняют размеры 56–60 px (десктопу можно уменьшить до 48 после решения), добавить `aria-current`, roving tabindex (↑/↓, Home/End, Enter), контекстное меню по ПКМ и по «⋯» при hover. Выделенная строка = открытый чат (уже есть). Для списка результатов поиска — тот же компонент.

**Не утверждено / решения:** контекстное меню строки (Del-меню описано в COMPONENTS 1.4, но не нарисовано); архив/закрепление/отключение уведомлений — решений нет; плотность строк на десктопе — решение менеджера.

### 5.3 Чат: пузыри и элементы ленты

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-msg` (`.in/.out`), `.pc-mb`, `.pc-out`, `.pc-trrow`, `.pc-orig` | сообщение с переводом, строкой «Переведено с…» и «Показать оригинал» | «Показать/Скрыть оригинал» (`aria-expanded`), исходящее: подпись «прочтёт на …» | пузырь surface, радиус 20; исходящий `--btn`; `max-width` 88 % | на 1440 лента 720 (проверено) | `.pc-msg` 20 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | выделение/копирование, ссылки, hover-панель действий, время по hover |
| `.pc-bubble`, `.pc-card`, `.pc-chip` | доклад Парло, карточка «кто ждёт», чипы быстрых просьб | чип: hover, pressed, focus, selected (`aria-pressed`) | чип ≥ 44 | — | `.pc-bubble` 10 экр.: `err-offline-banner`, `hero`, `home-chats`…; `.pc-chip` 10 экр.: `err-offline-banner`, `hero`, `home-chats`… | — |
| `.pc-draft`, `.pc-draft--edit`, `.pc-textarea` | черновик Парло: «Отправить / Изменить / Отмена», режим правки | ждёт подтверждения; правка | кнопки `--s` 44 | — | `.pc-draft` 3 экр.: `draft`, `draft-edit`, `states2` | реальное поле (textarea), Ctrl/Cmd+Enter — «Готово» (описано) |
| `.pc-ai`, `.pc-aimark` | пометка «Автоответ Парло (ИИ)…» | — | спарк-иконка + текст | — | 4 экр.: `call-protocol-deleted`, `chat`, `limit-err-call`… | — |
| `.pc-sysline`, `.pc-sysline--admin`, `.pc-day` | системные строки, «Админ теперь: …», дата | — | `--muted` 13 | — | `.pc-sysline` 10 экр.: `admin-transfer-done`, `group`, `group-admin-changed`… | — |
| `.pc-pcard`, `.pc-pcard--gone` | карточка протокола звонка в чате; «удалён у тебя» | normal / gone | — | на 1440 ≤ 720 | `.pc-pcard` 8 экр.: `call-detail`, `call-detail-group`, `call-notice`… | на 600 px карточка ломает слова (мой тест) |
| `.pc-failrow` | «Не отправлено» + «Повторить / Удалить» | `role=alert`, контур `--err` | тап ≥ 44 | — | 1 экр.: `err-send` | — |
| `.pc-req`, `.pc-reqacts`, `.pc-obj` | первое сообщение незнакомца: «Принять» / «Заблокировать» | — | `.pc-reqacts>*` ≤ 720 | — | 1 экр.: `stranger` | вид для веба не уточнён |

**Как перенести в веб:** сохранить пузыри и подписи; лента — колонка `--content-max` 720 по центру правой панели (уже на 1280/1440), пузыри `max-width` 88 % → на ≥1024 ограничить числом знаков (≈ 60–75), текст сделать выделяемым; кнопки «Показать оригинал» и «Повторить/Удалить» — в ленте как сейчас; добавить дату-разделитель, прокрутку к низу, «новые сообщения».

**Не утверждено / решения:** контекстное меню сообщения, ответ, пересылка, удаление, реакции — не нарисованы и не обсуждены; метка ИИ — решено (только у отправленных без просмотра); переводы в макете — заглушка; «Переключатель перевода чата» (D, `chat-tr-*`) — решено менеджером по праву Мурата §15, формулировки «не утверждено».

### 5.4 Ввод и поле сообщения

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-composer`, `.pc-composer-in`, `.pc-composer--v` | поле «Сообщение» / «Напиши или продиктуй Парло» + микрофон/отправить | обычное, focus (`:focus-within`), с текстом, запись | pill ≥ 52, кнопка 52 | compact: во всю ширину; regular+: ≤ 720 | `.pc-composer` 30 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | нет реального поля; многострочность, ссылки на файл/эмодзи не нарисованы |
| `.pc-btn--voice`, `.pc-ibtn--mic` | «Нажми и говори» | normal/hover/pressed/focus/disabled (`states2`) | 56, растёт с `--ts-c` | — | 129 экр.: `admin-transfer`, `admin-transfer-confirm`, `admin-transfer-done`… (общий класс) | `MediaRecorder`/разрешение микрофона; push-to-talk клавишей |
| `.pc-field`, `.pc-textarea` | e-mail гостя, текст черновика | `.is-focus` (поле), у textarea — **нет focus** | ≥ 56 | — | `.pc-field` 1 экр.: `call-guest-end`; `.pc-textarea` 2 экр.: `draft-edit`, `states2` | валидация (ошибка поля не нарисована), `type=email`, `autocomplete` |
| `.pc-wheel` | колесо «год рождения» | — | — | — | `ob-age` (1 экр.) | для веба нужен `select`/ввод года; **не утверждено** |
| `.pc-limline` | строка лимита над полем в группе; диктовка выключена | `disabled` у диктовки | красный контур как `.pc-lcard` | на XL/AX5 уходит в ленту | 1 экр.: `group-limit-inline` | строка 691–757 px на 1280/1440 (R4) |

**Как перенести в веб:** настоящий `<textarea>` с автовысотой и ограничением 720 (уже `.pc-composer-in`), Enter — отправка, Shift+Enter — перенос; кнопка микрофона зависит от решения по голосу в вебе (разрешение микрофона, ввод без аудио); чипы Парло — под полем или в панели Парло.

**Не утверждено / решения:** голос/диктовка Парло в вебе — вопрос продукту (разрешения браузера не нарисованы); возрастное колесо `.pc-wheel` для веба заменить на поле/список года — **решение менеджера**; ограничения длины сообщения — нет.

### 5.5 Диалоги, листы, меню

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-alert` + `.pc-scrim` | диалог подтверждения / выбора (удаление памяти, выход, лимиты, перевод чата, язык ответов, пропуск настройки) | `role=alertdialog`, `aria-modal`, фон `inert`; кнопки основная/danger сверху, вторичная ниже; скроллится при XL/AX5 | `min(360px, 100% − 32px)`, радиус 28, тень, `--scrim` | `left:50%; top:50%` кадра; hp: под сгибом; hl: правая половина | `.pc-alert` 21 экр.: `admin-transfer-confirm`, `call-protocol-delete`, `chat-tr-sheet`… | фокус-ловушка/Esc (только описаны); `dialog` вместо `alertdialog` для выбора; ширина для десктопа; Duo-закрытый (R1) |
| `.pc-menu` | быстрые действия: Новый чат, Позвонить, Продиктовать, Пригласить | compact: нижний лист на всю ширину с хэндлом и скримом; ≥600: поповер без скрима | лист: радиус 28, отступ 8; поповер: 300, радиус 20, слева у дока | ≥ 600 | 1 экр.: `home-menu` | `role=menu` есть (18 вхождений в кадрах RU); стрелки/Esc — описаны; позиционирование у кнопки вместо фиксированных `left:16;bottom:88` |
| `.pc-toast`, `.pc-snack` | короткое уведомление в звонке; «Хорошо, больше не напоминаем» | `role=status`; toast скрыт в hp/hl и AX5 | — | — | `.pc-toast` 2 экр.: `call`, `group-call`; `.pc-snack` 1 экр.: `home-reminder-closed` | место на десктопе (угол), автозакрытие, пауза по hover |

**Как перенести в веб:** **нижний лист → центрированный диалог** (на компакте нижний лист можно оставить): `.pc-alert` уже центрирован (360), для веба — `<dialog>` ширина 360–480, `aria-modal`, фокус-ловушка, Esc, возврат фокуса, клик по скриму закрывает только неопасные; поповер быстрых действий `.pc-menu` на ≥600 остаётся поповером 300 у дока; список «Язык ответов» (`settings-parrlo-more`) — выпадающий список/селект на вебе. Для Duo-закрытого исправить центрирование (R1) — к вебу не относится.

**Не утверждено / решения:** какие диалоги блокирующие; закрытие по скриму (решения нет); тексты диалогов юриста — дословно, остальные «формулировка: не утверждено»; веб-вариант выхода «сотрёт данные на этом устройстве» — решено менеджером Chat, формулировка не утверждена.

### 5.6 Баннеры, плашки, карточки состояния

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-banner` (`--info`, `--off`, `--err`), `.pc-card` | информирование, нет сети, ошибка | `role=status` / `role=alert` | радиус 20, фон `--warn-bg`/`--err-bg`/`--surface` | — | `.pc-banner` 20 экр.: `admin-transfer-error`, `call-failed`, `call-notice-again`… | закрытие (×) там, где допустимо; единая ширина (R4) |
| `.pc-grpai`, `.pc-previewstrip`, `.pc-callnow` | строка ИИ в группе (юр. текст дословно), превью, баннер «Идёт групповой звонок · Присоединиться» | `role=note` | мелкий 12–13, кнопка «Подробнее» ≥ 44 | на 1280 — 895, 1440 — 1019/1080, 1920 — 1499 | `.pc-grpai` 15 экр.: `admin-transfer-done`, `group`, `group-admin-changed`…; `.pc-callnow` 8 экр.: `group`, `group-admin-changed`, `group-admin-you`… | R4; hover на «Подробнее» |
| `.pc-lcard`, `.pc-ucard`, `.pc-meter`, `.pc-lrow` | лимиты: карточки периода/исчерпания, полоски без чисел | нормально / почти / исчерпано (`.is-full`, контур `--err`) | `.pc-meter` 12; `role=img` | `.pc-lcard` на 1440 — 1048 | `.pc-lcard` 3 экр.: `call-limit`, `group-call-limit`, `group-limit`; `.pc-meter` 8 экр.: `call-limit`, `group-call-limit`, `group-limit`… | числа лимитов нигде не показываются — **решено**; размеры лимитов, время сброса, планы — **не утверждено** |
| `.pc-remban`, `.pc-rec`, `.pc-badge` | баннер напоминания (две кнопки равной заметности), индикатор «идёт расшифровка ИИ», бейдж непрочитанных | `.pc-rec.is-off` — серый «Расшифровка остановлена» | бейдж ≥ 22 | — | `.pc-rec` 7 экр.: `call`, `call-limit`, `call-protocol`…; `.pc-badge` 34 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | индикатор записи неснимаемый — **решено**; напоминание: когда/сколько/тексты — **не утверждено** |
| `.pc-tbd`, `.pc-ph` | плашки «не утверждено» / «заглушка — финализируют юристы» | — | ≥ 13 px, янтарный `--beak`, пунктир | — | `.pc-tbd` 107 экр.: `admin-transfer`, `admin-transfer-confirm`, `admin-transfer-error`…; `.pc-ph` 16 экр.: `call-guest-end`, `call-notice`, `call-notice-again`… | только макет |

**Как перенести в веб:** баннеры показывать полосой на всю правую панель **или** в колонке 720 — выбрать одно (сейчас `.pc-grpai`/`.pc-callnow` на всю панель, лента — 720: R4); плашка `.pc-tbd` — только в макетах, в продукт не переносится; `.pc-ph` — пока юристы не дали текст.

**Не утверждено / решения:** все плашки `.pc-tbd` («не утверждено», «формулировка: не утверждено», «юрист проверит» — 107 экранов), заглушки `.pc-ph` (оператор, провайдеры ИИ, срок хранения), время сброса лимита, планы/цены, состав памяти, напоминание, кто удаляет протокол — см. §7.

### 5.7 Кнопки, формы и переключатели

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-btn` (`--glass`, `--text`, `--danger`, `--s`, `.pc-prov`) | основное/вторичное/текстовое/опасное действие, кнопка провайдера с индикатором | normal, hover `#007A53`, pressed `#006B48` + scale .98, focus-visible, disabled `#2A2F36`, busy (`aria-busy`) | высота ≥ 56 (44 у `--s`), радиус pill; белый на `--btn` 4,55:1 | на regular+ ширина колонки (440/480), на 1280 в панели ≤ 720 | `.pc-btn` 122 экр.: `admin-transfer`, `admin-transfer-confirm`, `admin-transfer-done`… | `:active` без scale для мыши; `type=button/submit`; состояние «загрузка» для веба |
| `.pc-ibtn` (`--plain`, `--mic`, `--tog`) | иконка-кнопка, переключатель перевода в шапке (`aria-pressed`) | normal/hover `#3E4548`/pressed `#2B3033`/focus/disabled | 44×44 (mic 52) | Duo: рейка | `.pc-ibtn` 129 экр.: `admin-transfer`, `admin-transfer-confirm`, `admin-transfer-done`… | всплывающие подсказки (`title`: 0 вхождений) — нужны на десктопе |
| `.pc-switch`, `.pc-switchrow` | переключатель + строка | `aria-checked`, `.is-disabled` (opacity .5), focus; **hover нет** | 51×31, хит-область ≥ 44 | — | `.pc-switch` 22 экр.: `chat-tr-sheet`, `chat-tr-sheet-off`, `contact-block`… | hover; Space (описан); disabled с причиной (`aria-disabled` есть) |
| `.pc-check` | чекбокс-строка («Мне исполнилось 18», «Принимаю условия») | `aria-checked`, hover, focus; не отмечен заранее — **решено** | строка ≥ 60, рамка 2 px `#8A94A1` | — | `.pc-check` 2 экр.: `states`, `voice-18` | — |
| `.pc-linkrow` | ссылки «Условия» / «Политика» | — | тап ≥ 44 | — | `.pc-linkrow` 12 экр.: `group-ai-info`, `group-join`, `group-join-error`… | настоящие `<a href>` (в кадрах всего 4 `<a href>`, остальное — кнопки) |

**Как перенести в веб:** кнопки: основная 56 → 44–48 на десктопе (решение), ширина по содержимому в диалогах и панелях, `Enter`/`Space`; переключатель `.pc-switch` → нативный `input[role=switch]` или `button[role=switch]`; чекбокс/радио — нативные элементы со стилем; добавить hover/активное для `.pc-switch`.

**Не утверждено / решения:** размеры контролов для десктопа (56 vs 44), тексты «не утверждено» на кнопках, вид disabled (50 %).

### 5.8 Звонок

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-call`, `.pc-stagecall`, `.pc-videoarea`, `.pc-self` | сцена звонка: видео собеседника, своё окошко | заглушка с аватаром | окошко 56×84 у угла | на 1440: сцена ≈ 1050 px без `max-width` | `.pc-videoarea` 4 экр.: `call`, `call-limit`, `group-call`… | `aspect-ratio`, полный экран, PiP; камера/микрофон — разрешения |
| `.pc-subs`, `.pc-rec`, `.pc-toast` | субтитры на языке слушателя (говорящий, текст, «Перевод с …»), индикатор записи, уведомление | `aria-live=polite`; toast скрыт на AX5/в hp,hl | 20/500 | на 1440 субтитры во всю сцену ≈ 1050 | `.pc-subs` 2 экр.: `call`, `group-call` | ограничить ширину субтитров; `aria-live` не прерывать |
| `.pc-ctrls`, `.pc-callbar` | микрофон, завершить, протокол | hover/pressed/focus (общие `.pc-ibtn`) | 44–52 | Duo hp: нижняя половина | `.pc-ctrls` 4 экр.: `call`, `call-limit`, `group-call`… | горячие клавиши (M — микрофон — предложение, не утверждено); подсказки |
| `.pc-tiles`, `.pc-tile` | плитки группового звонка (имя, говорящий — контур) | `.speak` | `min-height` 86 | 2 колонки / 3 на ≥600 | `.pc-tile` 2 экр.: `group-call`, `group-call-limit` | адаптивная сетка; на 1440 6 плиток занимают ~1/3 сцены (пусто) |
| `.pc-callst`, `.pc-acts2`, `.pc-explicit` | шапка экрана звонка, пара «Позвонить/Написать», строка явного согласия | пара кнопок — колонка в AX5/hl | аватар 96–112 | — | `.pc-callst` 7 экр.: `call-connecting`, `call-detail`, `call-detail-group`…; `.pc-explicit` 4 экр.: `call-notice`, `call-notice-again`, `call-notice-guest`… | — |

**Как перенести в веб:** видео-сцена с `aspect-ratio` 16:9 и `max-width`, субтитры внизу сцены (≤ 720), справа панель протокола 360 (уже на 1440); на ≥1024 допустимо отдельное окно/вкладка звонка; кнопки: микрофон, завершить, протокол; плитки группы — `grid auto-fill minmax(240px,1fr)` вместо «2 колонки compact / 3 regular»; перед входом — `call-notice` как центрированный диалог/страница с явным согласием (обязательно, текст юриста).

**Не утверждено / решения:** согласие «Продолжить» — **решено** (от каждого участника, на каждую встречу); экран гостя, поведение идущего звонка при исчерпании лимита, кто может удалить протокол — **не утверждено**; разрешения камеры/микрофона, выбор устройств, демонстрация экрана — не нарисованы; поведение в вебе при потере сети — не нарисовано.

### 5.9 Поиск

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-search`, `.pc-searchfield`, `.pc-srow` | поле поиска (док / строка с «Отмена») | hover `#3E4548`, focus, с запросом + очистка (≥ 44), `role=search` | pill, высота 52 | XL/AX5: «Отмена» следующей строкой | `.pc-search` 40 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | реальный `<input type=search>`; дебаунс, история запросов — не нарисованы |
| `.pc-hits`, `.pc-hit`, `.pc-m` | результаты + подсветка совпадения (не только цветом) | `.is-cur` — текущее | — | — | `.pc-hit` 3 экр.: `calls`, `calls-missed`, `search-home-results`; `.pc-m` 2 экр.: `search-chat`, `search-home-results` | — |
| `.pc-sbarw`, `.pc-sbar`, `.pc-snav` | поиск в чате: поле, счётчик `role=status`, стрелки ↑/↓ | disabled у стрелок | — | Duo: стрелки в рейке | `.pc-sbar` 2 экр.: `search-chat`, `search-chat-empty` | горячие клавиши навигации по совпадениям |

**Как перенести в веб:** поиск — поле вверху боковой панели с открытием по Ctrl/Cmd+K и `/` (предложение); результаты («Чаты», «Контакты») — выпадающая панель/список в сайдбаре; поиск в чате — строка над лентой с ↑/↓ (Enter/Shift+Enter — следующее/предыдущее).

**Не утверждено / решения:** вход в историю звонков (вкладка или «Позвонить») — **не утверждено**; «Протоколы звонков и память Парло в поиск не входят» — формулировка наша; горячие клавиши — не утверждено.

### 5.10 Настройки

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-setlist`, `.pc-setrow`, `.pc-sech` | группа строк настроек, заголовок секции (+ `.pc-tbd`) | см. 5.2 | см. 5.2 | — | `.pc-sech` 33 экр.: `call-detail-group`, `calls`, `calls-missed`… | навигация по разделам слева, поиск по настройкам — не нарисованы |
| `.pc-switchrow` | переключатели «Переводить сообщения», «Напоминание про Парло» | см. 5.7 | — | — | `.pc-switchrow` — 22 экр.: `chat-tr-sheet`, `chat-tr-sheet-off`, `contact-block`… | — |
| `.pc-pers`, `.pc-prof` | выбор образа Парло (3 варианта), шапка профиля контакта | radio | аватар 48 / 96 | — | `.pc-pers` 5 экр.: `ob-parrlo-setup`, `ob-parrlo-setup-error`, `ob-parrlo-setup-skip`…; `.pc-prof` 6 экр.: `contact-block`, `contact-blocked`, `contact-error`… | выбор образа — решение Мурата (по умолчанию образ 1) |

**Как перенести в веб:** на ≥1024 — окно/страница с левым меню разделов (Парло, Перевод, Приложение, Аккаунт, Уведомления, Язык, О приложении) и панелью справа (master–detail); на компакте — как сейчас; «Выход» — веб-вариант диалога (`settings-account-logout-web`); удаление аккаунта — двухшаговое, как нарисовано.

**Не утверждено / решения:** состав и пути настроек — **решено** менеджером Chat (пакет A), но формулировки веб-выхода и удаления — «формулировка не утверждена»/«юрист проверит»; образ Парло выбирает Мурат; хранение/срок данных — заглушка юристов.

### 5.11 Пустые состояния, ошибки, загрузка

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-es` | пустое состояние (контакты, группа, память, поиск, протокол) | `role=status` | иконка 72 (растёт `--ts-i`) | — | `.pc-es` 15 экр.: `call-guest-declined`, `call-guest-end-sent`, `calls-empty`… | — |
| `.pc-banner--off`, `.pc-banner--err`, `.pc-failrow` | нет сети, ошибка действия, не отправлено | `role=status` / `alert` | — | — | см. 5.6 | глобальный индикатор соединения; повтор по событию «online» |
| `.pc-skel`, `.pc-skeln`, `.pc-pskel`, `.pc-loadline`, `.pc-spin`, `.pc-statusln` | заглушки загрузки, строка статуса со спиннером | `aria-hidden` у скелетона; спиннер отключается при reduced-motion | спиннер 24 / 18 | — | `.pc-skel` 2 экр.: `calls-loading`, `search-home-loading`; `.pc-spin` 7 экр.: `admin-transfer-wait`, `calls-loading`, `contact-loading`… | `aria-busy` на контейнере; анимация скелетона не заявлена |

**Как перенести в веб:** сохранить `.pc-es` (иконка 72, заголовок, ≤ 32 знаков в строке, одна кнопка); офлайн-баннер — глобально над списком (уже `err-offline-banner`); ошибка отправки — как `.pc-failrow`; скелетоны — размером с реальный контент; `prefers-reduced-motion` отключает пульс/спиннер; для HTTP-ошибок/404/сессии истекла экранов нет.

**Не утверждено / решения:** тексты ошибок — «формулировка: не утверждено» там, где нет юр. текста; повторные попытки/таймауты — не определены.

### 5.12 Бренд и образ Парло

| Компонент (классы) | Назначение | Состояния (в макете) | Токены, размеры | Брейкпоинты / адаптация | Где используется | Чего не хватает для веба |
|---|---|---|---|---|---|---|
| `.pc-persona`, `.pc-stage`, `.pc-av`, `.pc-brand`, `.pc-bigav` | аватар Парло, сцена на главной (кнопка), аватары людей | stage: hover, focus; персонаж: слушает/думает/говорит | 32/44/56/88/112/120/168 | compact — по центру; regular+ — над списком | `.pc-persona` 54 экр.: `admin-transfer-done`, `call-notice`, `call-notice-again`…; `.pc-stage` 34 экр.: `admin-transfer-done`, `call-protocol-deleted`, `chat`… | альтернативный текст у декоративных образов (`aria-hidden`) — есть |

**Как перенести в веб:** SVG-образ (`.pc-persona`, три варианта) оставить; в списке чатов — сцена Парло; wordmark «Parrlo Chat» — Nunito 900, не капсом.

**Не утверждено / решения:** выбор образа — Мурат; три образа остаются, выбирает Мурат (SPEC §10); сайт-hero — нейтральная рамка (`APPLE-MARKETING-RULES.md`).

## 6. Что нужно решить Мурату / менеджеру до веб-версии

| № | Вопрос | Почему | Кто решает |
|---|---|---|---|
| 1 | Раскладка настроек, поиска, звонков и онбординга на ≥ 1024: колонка 480 по центру (как сейчас), окно с боковым меню или «список | деталь» | R3: на 1280/1440 половина экрана пуста; колонка 440/480 — решение дизайна для приложения, для веба не утверждено | менеджер Chat / Мурат |
| 2 | Схлопывание панелей при XL/AX5 на десктопе | в вебе масштаб — это zoom браузера; на 1280 AX5 пропадает список чатов; SPEC §10 принял схлопывание для приложения | менеджер Chat |
| 3 | Порог двух панелей и минимальная ширина окна (сейчас 600) | при 600–833 деталь ≈ 280 px; доп. проверка 600/599 — переход рывком | менеджер дизайна |
| 4 | Единая ширина плашек (всю панель или колонка 720) | R4: `.pc-grpai`, `.pc-callnow`, `.pc-lcard` на 1440 шире ленты | менеджер дизайна |
| 5 | Горячие клавиши (Ctrl/Cmd+K, Ctrl/Cmd+N, `/`) и их показ в UI | в COMPONENTS — только предложение | Мурат |
| 6 | Светлая тема и `prefers-contrast`/`forced-colors` | в CSS только тёмная; контраст описан только для тёмной | Мурат |
| 7 | Размеры контролов на десктопе (кнопка 56 → 44–48? строка 60 → 48?) | тач-размеры по HIG; в вебе — плотность | менеджер дизайна |
| 8 | Диалоги: `dialog` / `alertdialog`, закрытие по скриму и Esc | сейчас везде `alertdialog`, нижний лист/центр — по ширине | менеджер дизайна + доступность |
| 9 | Голос/звонок/камера в вебе: разрешения браузера, выбор устройств, демонстрация экрана, потеря сети | экранов нет | Мурат / продукт |
| 10 | Веб-функции, которых нет в SPEC: ПКМ-меню, ответ/пересылка/реакции, вложения/эмодзи, drag&drop, уведомления, URL/навигация, 404/сессия истекла | не нарисованы, не обсуждены | Мурат |
| 11 | Возрастное колесо `.pc-wheel` в вебе | колесо — тач-жест; нужен ввод/выбор года | менеджер дизайна |
| 12 | Заглушки `.pc-ph`/`.pc-tbd` (107 экранов): оператор, провайдеры ИИ, сроки хранения, лимиты/планы/сброс, напоминание, права удаления протокола, формулировки диалогов | финализируют юристы / решения Мурата, SPEC §12–§15 | юристы / Мурат |
| 13 | Образ Парло (из трёх) | SPEC §10: выбирает Мурат | Мурат |
| 14 | Размеры Duo (669×951, камера, сгиб) | допущение safearea.info, не Apple; сверить в Xcode/Device Hub (SPEC §8) | Мурат/разработка |

*Отчёт сформирован автоматически по клону `83159db` и DOM-метрикам Chromium; WebKit/Safari не проверялся; реальные Duo-устройства не проверялись.*
