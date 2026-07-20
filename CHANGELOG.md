# Changelog

## 1.0.0 (2026-07-20)


### Features

* **companion:** reading companion mode - spoiler-safe aura while a book is in progress ([b81bf7d](https://github.com/rfsbraz/orrery/commit/b81bf7d38889fa23fd79544bd9b2addce2fda4c3))
* **connections:** connections map - arc diagram + spoiler-gated character threads ([3c93462](https://github.com/rfsbraz/orrery/commit/3c93462c5dddfe61f851f75cf080abe2bf66a4b5))
* **content:** TS types, [[ref]] parser, YAML loader with derived default order; vitest (11 tests) ([308d34c](https://github.com/rfsbraz/orrery/commit/308d34cdb1c90c6f1cb810fc3b16b99feebd2df1))
* **core:** capability system + spoiler engine (framework seam for per-franchise features) ([2c0d02c](https://github.com/rfsbraz/orrery/commit/2c0d02cacfd1f20cf35ab792d6f39c11ed5140ee))
* **design:** modern editorial theming - literary serif display, restrained palette, the Beam signature (CONCEPT §6 design law); bump content ([da71ce1](https://github.com/rfsbraz/orrery/commit/da71ce10020ff408515c3a3192b43ed802e06037))
* **editions:** editions layer - covers in the museum + exact-edition store links ([8dfd2d5](https://github.com/rfsbraz/orrery/commit/8dfd2d5055632752fcd42621b1f3705c528c4ddf))
* **franchise:** show the author biography on the author page ([#39](https://github.com/rfsbraz/orrery/issues/39)) ([d4202cb](https://github.com/rfsbraz/orrery/commit/d4202cb152b2ed91b5323170d0ee46f4cbd803b6))
* **hall:** cross-franchise hall - every author on one timeline (/hall) ([6a40fde](https://github.com/rfsbraz/orrery/commit/6a40fde0c790ef64f93a77d1a5a575edfa7212f3))
* **home:** author-first listing, order selector drives the walk, contribute links ([681c4f9](https://github.com/rfsbraz/orrery/commit/681c4f9eecff7b4d5a52954ef66c57086305b83a))
* **i18n:** locale-routed pages with pt-PT chrome and published edition titles ([4a2918f](https://github.com/rfsbraz/orrery/commit/4a2918fb25c4f79bff0a7cb3fdbc30405b702294))
* **i18n:** merge translation overlays for curated prose ([96b4891](https://github.com/rfsbraz/orrery/commit/96b4891224d15e924a86fbfccb29538aaa7f582a))
* **i18n:** translate the account and community surfaces ([1e5fdaa](https://github.com/rfsbraz/orrery/commit/1e5fdaa615caafc7118f6e4479d3480171f6dc1d))
* **lab:** Strata - series entry labels, per-book read marking, overall progress bar (+ guest progress) ([51b70e2](https://github.com/rfsbraz/orrery/commit/51b70e2f54dc02093e6d0bd530350b19d8545c69))
* **lab:** three river vertical-view concepts - Beam, Margin, Strata (/f/&lt;slug&gt;/river/lab) ([dc2e56a](https://github.com/rfsbraz/orrery/commit/dc2e56afd5ab5864578bac1f162db933369c4fc0))
* **orders:** order diff - shared spine + forks with rationale (/f/&lt;slug&gt;/compare) ([3f669cd](https://github.com/rfsbraz/orrery/commit/3f669cdd2e097c91075884e7f03a1470e8c85f62))
* **pages:** home, franchise museum (themed timeline + orders + eras), author pages ([bc6858f](https://github.com/rfsbraz/orrery/commit/bc6858f701396cded87c4de0fece0d49792fa59a))
* **phase2:** Goodreads/StoryGraph CSV import + personal timeline overlay (8 tests) ([19b51cf](https://github.com/rfsbraz/orrery/commit/19b51cf90fece3408f75c33c8652217e7b260e2d))
* **phase2:** Goodreads/StoryGraph CSV import UI ([aceca4a](https://github.com/rfsbraz/orrery/commit/aceca4a977fbeabc00b27e57b256bd58a16b95a3))
* **phase2:** per-country find-a-copy store links ([ee26664](https://github.com/rfsbraz/orrery/commit/ee266643b1f72097eca77d908e8e56d812bcc632))
* **phase2:** public profiles at /u/[handle] ([c79921d](https://github.com/rfsbraz/orrery/commit/c79921d2f8c6cbb04c2bd4f474ceb90c48ed3c39))
* **phase2:** Supabase client/server helpers + progress data access (env-guarded, build-safe) ([915ee6b](https://github.com/rfsbraz/orrery/commit/915ee6b76d947b38495574a9eee0cbd7bd421459))
* **phase2:** Supabase schema + RLS; data-driven achievements engine (8 tests) ([4d3cfb0](https://github.com/rfsbraz/orrery/commit/4d3cfb0edb8c5bf5f47a8e156b29927bba6a1585))
* **phase2:** user accounts, progress tracking, and personal overlay ([2bb0d1c](https://github.com/rfsbraz/orrery/commit/2bb0d1c18d6249ded33507fb710775853f1c62b3))
* **phase3:** book clubs with shared progress board + curator credits ([bfd7c76](https://github.com/rfsbraz/orrery/commit/bfd7c761939bdbadf91c477a832c4871230eab35))
* **phase3:** community reading orders with submission, voting, moderation ([1575eb0](https://github.com/rfsbraz/orrery/commit/1575eb0fdd98086b965868fba0c7f941a995d79e))
* **pwa:** installable app with offline reading, plus mobile-first touch design ([5e861fd](https://github.com/rfsbraz/orrery/commit/5e861fdf0496eeda5e1ddb8073e5fc632305f8c5))
* **recap:** year-in-reading recap + shareable card (/me/recap/&lt;year&gt;) ([2e952b2](https://github.com/rfsbraz/orrery/commit/2e952b2868a84e9d9f7dfb7ad6e4e5dd6b1f5572))
* **river:** promote Strata to the default River view; retire the lab ([eade1fc](https://github.com/rfsbraz/orrery/commit/eade1fc5a712190db6ec8f83d47683ea5aeb687d))
* **river:** strata walk is the franchise root; era plates announce each new era ([ad9e071](https://github.com/rfsbraz/orrery/commit/ad9e071db338266915b391e17f2ad48bb71c5cf5))
* **river:** the River view - atmospheric era-sectioned aura browse ([cfdf68f](https://github.com/rfsbraz/orrery/commit/cfdf68f45460c0a7a347565010cb75cfa2efda83))
* scaffold Next.js app (App Router, TS, Tailwind) + orrery-content submodule ([3b39f80](https://github.com/rfsbraz/orrery/commit/3b39f8077bbac1c4f7d6946562edee42398f2cd2))
* **wizard:** where-to-start guided onboarding (/f/&lt;slug&gt;/start), content-driven paths ([e35b722](https://github.com/rfsbraz/orrery/commit/e35b722a07af5407f85705438d309fc6df0b98b5))


### Bug Fixes

* **aura:** gate global events to the author's lifetime ([#33](https://github.com/rfsbraz/orrery/issues/33)) ([c0f5bcc](https://github.com/rfsbraz/orrery/commit/c0f5bccf3731e5ff173ae22d7ff22433be8d7fd8))
* **i18n:** accept flat life-event overlays; regression tests for translation merge ([083be3e](https://github.com/rfsbraz/orrery/commit/083be3e5cca27d9c3c66b705cf37326f9598f57c))
* **i18n:** back-links, sign-in prompts and page titles on account surfaces ([90bede9](https://github.com/rfsbraz/orrery/commit/90bede9fb1227cd692bd24c2439596b7f765c1cf))
* **i18n:** honour Accept-Language on unprefixed paths; explicit choice wins ([7ee1cb4](https://github.com/rfsbraz/orrery/commit/7ee1cb49166645b98fde0bf0b0314c2056ecbf41))
* **i18n:** keep inline references inside the reader's locale ([#40](https://github.com/rfsbraz/orrery/issues/40)) ([8b8b58e](https://github.com/rfsbraz/orrery/commit/8b8b58e5389184a5529741a089b36bd314be460f))
* **i18n:** overlay character descriptions; assert every prose collection ([7698e51](https://github.com/rfsbraz/orrery/commit/7698e51a445f07dda218a3f4c3f533409b2b7ebd))
* **i18n:** stop overlays clobbering nested structure ([#38](https://github.com/rfsbraz/orrery/issues/38)) ([8e68af6](https://github.com/rfsbraz/orrery/commit/8e68af6a45061ef64723f9e3760c37be5c0060d0))
* **i18n:** thread locale through every content entry point ([b28083f](https://github.com/rfsbraz/orrery/commit/b28083f5e3ba54f0fd920808749c19bd466a964f))
* **mobile:** raise the phone/desktop threshold to lg and enlarge small type ([#31](https://github.com/rfsbraz/orrery/issues/31)) ([26a9fda](https://github.com/rfsbraz/orrery/commit/26a9fda6af65e34ade9c749f86e18df183bb039f))
* **mobile:** raise the phone/desktop threshold to lg and enlarge small type ([#32](https://github.com/rfsbraz/orrery/issues/32)) ([8428b2e](https://github.com/rfsbraz/orrery/commit/8428b2ec80c783f2fcb9ec47c855549ad0a58083))


### Content

* bump orrery-content submodule to 309a833 ([#37](https://github.com/rfsbraz/orrery/issues/37)) ([5ec5900](https://github.com/rfsbraz/orrery/commit/5ec59000978e3cded3f7aeffad5e0f9e5a096ced))
* bump orrery-content submodule to 6fcbfe4 ([#41](https://github.com/rfsbraz/orrery/issues/41)) ([e5ecfd3](https://github.com/rfsbraz/orrery/commit/e5ecfd3cd090f855562e9795b97c0312516924de))
* bump orrery-content submodule to 9e418e6 ([#42](https://github.com/rfsbraz/orrery/issues/42)) ([d6ef93d](https://github.com/rfsbraz/orrery/commit/d6ef93d437edb4a0a583c468404ebb5aaf6e8154))
* bump orrery-content submodule to c4e14a3 ([#34](https://github.com/rfsbraz/orrery/issues/34)) ([d8b9938](https://github.com/rfsbraz/orrery/commit/d8b99386c6d3d251158cf85f56d3464610729ace))
