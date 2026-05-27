-- Blogger to Supabase Migration
-- Maps tags to categories, extracts pull quotes, generates excerpts, calculates read time
-- Skips DRAFT posts

BEGIN;

-- Delete existing dummy posts (optional - remove if you want to keep them)
DELETE FROM posts WHERE created_at > NOW() - INTERVAL '30 days';

-- Insert migrated posts
INSERT INTO posts (
    id, title, slug, content, excerpt, pull_quote, category, tags,
    read_time, issue, cover_art, text_only, featured, published,
    published_at, created_at, updated_at
) VALUES
-- Post 1: 5-minute science: Explosives and Nobel Prize
(
    gen_random_uuid(),
    '5-minute science: Explosives and Nobel Prize - A Summa of Human Achievement Founded in Vanity',
    '5-minute-science-explosives-and-nobel',
    '<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4HpRL7HPbROHmizjOd-b5rKtLpE7hPLamkStOLo0S9U4sXXSFgY6a-7QXJpdnj_6dm7aLZk5KEbPiC1qAxqVB3iE2qGOQ0Z0Nq-GIf1HsACzHYsbqrbeywbUiP1Lrg112kW6Vou9bArP_iVDpaj_ysQeFMehUKDd1hdGz---6amle2en06XAXo7Hn/s600/stick-dynamite-570272.jpg.webp"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4HpRL7HPbROHmizjOd-b5rKtLpE7hPLamkStOLo0S9U4sXXSFgY6a-7QXJpdnj_6dm7aLZk5KEbPiC1qAxqVB3iE2qGOQ0Z0Nq-GIf1HsACzHYsbqrbeywbUiP1Lrg112kW6Vou9bArP_iVDpaj_ysQeFMehUKDd1hdGz---6amle2en06XAXo7Hn/w640-h288/stick-dynamite-570272.jpg.webp" width="640" /></a></div><h4>Nitroglycerin</h4><p>For centuries, the only dependable explosive for use was gunpowder (now called black powder) which contains carbon, sulfur, and potassium nitrate...</p>',
    'For centuries, the only dependable explosive for use was gunpowder. But in 1846, an Italian chemist discovered nitroglycerin—a far more efficient and deadly explosive that yields 35 molecules of gas from just 4 molecules of liquid.',
    'We normally see Nobel Peace Prize as exalted, a summa of human achievement but it was actually an attempt of a dying man to whitewash his reputation—it was founded in vanity.',
    'systems',
    ARRAY['science', 'history', 'explosives', 'nobel'],
    12,
    NULL,
    '{"image_url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj4HpRL7HPbROHmizjOd-b5rKtLpE7hPLamkStOLo0S9U4sXXSFgY6a-7QXJpdnj_6dm7aLZk5KEbPiC1qAxqVB3iE2qGOQ0Z0Nq-GIf1HsACzHYsbqrbeywbUiP1Lrg112kW6Vou9bArP_iVDpaj_ysQeFMehUKDd1hdGz---6amle2en06XAXo7Hn/w640-h288/stick-dynamite-570272.jpg.webp"}',
    false,
    true,
    true,
    '2022-04-17T09:28:00.002Z',
    '2022-04-17T07:20:00.455Z',
    '2022-04-17T09:46:14.100Z'
),
-- Post 2: Why are insects smaller now?
(
    gen_random_uuid(),
    '5-minute science: Why are insects smaller now?',
    '5-minute-science-why-are-insects',
    '<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgL55dXGhneMhd2WSzKquVbp3PtyRl8c5R9WT9RuqIy3UOERiiTdBZ2Xe0lVSrVYBB7A5M51XqMqaHX5bAe3zUPd4ivno6xXlL43L6QLaQBsY-_MeB4UUfrGMM76E79fu1AH2RKgWm-3Vny9mExuFzP-chdFNkAuxrMwrcOjF429cIvA1idJrTLFFFg/w640-h360/cover.jpeg"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgL55dXGhneMhd2WSzKquVbp3PtyRl8c5R9WT9RuqIy3UOERiiTdBZ2Xe0lVSrVYBB7A5M51XqMqaHX5bAe3zUPd4ivno6xXlL43L6QLaQBsY-_MeB4UUfrGMM76E79fu1AH2RKgWm-3Vny9mExuFzP-chdFNkAuxrMwrcOjF429cIvA1idJrTLFFFg/w640-h360/cover.jpeg" width="640" /></a></div><p>During the Paleozoic era, the Earth teemed with giant insects...</p>',
    'During the Paleozoic era, the Earth teemed with giant insects, from dragonflies the size of seagulls to spiders as wide as tires. Today truly giant insects no longer exist. Why?',
    'The answer is: oxygen.',
    'systems',
    ARRAY['science', 'evolution', 'insects', 'oxygen'],
    10,
    NULL,
    '{"image_url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgL55dXGhneMhd2WSzKquVbp3PtyRl8c5R9WT9RuqIy3UOERiiTdBZ2Xe0lVSrVYBB7A5M51XqMqaHX5bAe3zUPd4ivno6xXlL43L6QLaQBsY-_MeB4UUfrGMM76E79fu1AH2RKgWm-3Vny9mExuFzP-chdFNkAuxrMwrcOjF429cIvA1idJrTLFFFg/w640-h360/cover.jpeg"}',
    false,
    true,
    true,
    '2022-03-26T14:32:00Z',
    '2022-03-26T12:57:28.077Z',
    '2022-03-26T14:32:15.455Z'
),
-- Post 3: Laniakea
(
    gen_random_uuid(),
    '5-minute science: Laniakea - The Immeasurable Heaven',
    '5-minute-science-laniakea-immeasurable',
    '<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/a/AVvXsEioTEUk36tqHVMrF1taYPMsDSCxbv9AqTMvCYxN-Tes8Mc8gEXIScC8218oxl1dPxxdVBYufxfo2WSg2Oek0pGYpmUAVy-rAYy5X-l2dukvXgvvMeSJA1yo1u13RpDmYKCYlIlC504uqI5n34MnUR0M0uVxn38uXFjrso_xskKXFayKTXILq2noiw4U=w640-h400"><img src="https://blogger.googleusercontent.com/img/a/AVvXsEioTEUk36tqHVMrF1taYPMsDSCxbv9AqTMvCYxN-Tes8Mc8gEXIScC8218oxl1dPxxdVBYufxfo2WSg2Oek0pGYpmUAVy-rAYy5X-l2dukvXgvvMeSJA1yo1u13RpDmYKCYlIlC504uqI5n34MnUR0M0uVxn38uXFjrso_xskKXFayKTXILq2noiw4U=w640-h400" width="640" /></a></div><p>Quantities like 100 trillion kilometers are extremely unwieldy to write...</p>',
    'Quantities like 100 trillion kilometers are extremely unwieldy to write. But when can we use that big of a number anyway? The answer is: for interstellar distances.',
    'Laniakea is 520 million light years across and its borders encompass as many as 100,000 individual galaxies. Appropriately its name comes from a Hawaiian word meaning ''immeasurable heaven''.',
    'systems',
    ARRAY['science', 'space', 'laniakea', 'universe'],
    11,
    NULL,
    '{"image_url": "https://blogger.googleusercontent.com/img/a/AVvXsEioTEUk36tqHVMrF1taYPMsDSCxbv9AqTMvCYxN-Tes8Mc8gEXIScC8218oxl1dPxxdVBYufxfo2WSg2Oek0pGYpmUAVy-rAYy5X-l2dukvXgvvMeSJA1yo1u13RpDmYKCYlIlC504uqI5n34MnUR0M0uVxn38uXFjrso_xskKXFayKTXILq2noiw4U=w640-h400"}',
    false,
    true,
    true,
    '2022-03-05T05:02:00.008Z',
    '2022-03-05T03:31:32.585Z',
    '2022-03-05T05:11:39.443Z'
),
-- Post 4: The 170,000-year-old Sunlight
(
    gen_random_uuid(),
    '5-minute science: The 170,000-year-old Sunlight',
    'the-170000-year-old-sunlight',
    '<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/a/AVvXsEiJiu1YHLPIjP3tpzzThbVH-uEZsHLmvF5h7kXnjCZeCyfHA6ljVm7KBZWMhtQehV0lU2kvcVohEH_sjAIizMRApqPbBRsYocsFXJx6ulawP181oDeVuTw7iuIXahhfTe3SWtyC20AyPw0j3cKD-0mbO5j7n6p8Jz30a-ZSMILvbzzIMUNVIYaH9C6n=w640-h360"><img src="https://blogger.googleusercontent.com/img/a/AVvXsEiJiu1YHLPIjP3tpzzThbVH-uEZsHLmvF5h7kXnjCZeCyfHA6ljVm7KBZWMhtQehV0lU2kvcVohEH_sjAIizMRApqPbBRsYocsFXJx6ulawP181oDeVuTw7iuIXahhfTe3SWtyC20AyPw0j3cKD-0mbO5j7n6p8Jz30a-ZSMILvbzzIMUNVIYaH9C6n=w640-h360" width="640" /></a></div><p>When you go outside on a sunny day, you''ll feel the heat and brightness of the Sun...</p>',
    'When you go outside on a sunny day, you''ll feel the heat and brightness of the Sun. But the journey which allows us to feel this radiation is astoundingly complex.',
    'The heat and light we feel and see is an epic astrophysical journey. The sunshine that warms and illuminates our world was born 170,000 years ago in the heart of the Sun.',
    'systems',
    ARRAY['science', 'sun', 'physics', 'light'],
    10,
    NULL,
    '{"image_url": "https://blogger.googleusercontent.com/img/a/AVvXsEiJiu1YHLPIjP3tpzzThbVH-uEZsHLmvF5h7kXnjCZeCyfHA6ljVm7KBZWMhtQehV0lU2kvcVohEH_sjAIizMRApqPbBRsYocsFXJx6ulawP181oDeVuTw7iuIXahhfTe3SWtyC20AyPw0j3cKD-0mbO5j7n6p8Jz30a-ZSMILvbzzIMUNVIYaH9C6n=w640-h360"}',
    false,
    false,
    true,
    '2022-02-20T05:49:00.018Z',
    '2022-02-20T04:44:17.278Z',
    '2022-03-05T03:31:21.510Z'
),
-- Post 5: 스트레스가 많을 때 어떻게 해요?
(
    gen_random_uuid(),
    '스트레스가 많을 때 어떻게 해요?',
    'stress-management-korean',
    '<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgE7cGNsulYBhA9FK826U2_vJXI4h0oHia_WUwaRM8WeuSRmLl6DT_eM1PGmbZF5SoPEHZc27akhLliLGrdYmj5oha3LHiuxoNDAbUKxMhSvrfvrwB7QQ-F3xc1TmN3IstcIbL3fTxQcMs/w400-h266/img.jpeg"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgE7cGNsulYBhA9FK826U2_vJXI4h0oHia_WUwaRM8WeuSRmLl6DT_eM1PGmbZF5SoPEHZc27akhLliLGrdYmj5oha3LHiuxoNDAbUKxMhSvrfvrwB7QQ-F3xc1TmN3IstcIbL3fTxQcMs/w400-h266/img.jpeg" width="400" /></a></div><p>어른이 된다는 것은 스트레스가 많지요?...</p>',
    '어른이 된다는 것은 스트레스가 많지요? 여러분은 스트레스가 많을 때 어떻게 해요?',
    '우리가 좋아하는 것을 하면, 스트레스가 풀릴 거에요.',
    'craft',
    ARRAY['language', 'korean', 'lifestyle'],
    5,
    NULL,
    '{"image_url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgE7cGNsulYBhA9FK826U2_vJXI4h0oHia_WUwaRM8WeuSRmLl6DT_eM1PGmbZF5SoPEHZc27akhLliLGrdYmj5oha3LHiuxoNDAbUKxMhSvrfvrwB7QQ-F3xc1TmN3IstcIbL3fTxQcMs/w400-h266/img.jpeg"}',
    false,
    false,
    true,
    '2021-06-26T14:09:00.009Z',
    '2021-06-26T12:11:26.176Z',
    '2021-06-26T14:40:24.806Z'
),
-- Post 6: The Chemical Tale of Silicon
(
    gen_random_uuid(),
    'The Chemical Tale of Silicon',
    'the-chemical-tale-of-silicon',
    '<div class="separator" style="clear: both; text-align: center;"><a href="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgieXZo4iRk5jryGSPw4E5LNt-7CnQCY2chdBAKUVplU-QQDMyb50SbPdsOH8xFsRzhHLj42kGh-inI_KWNZC9l04nZ2Xbf9R_VdJi2XgLd_QUECqP_JjGTbNAxU3EV81pA8X1zeaR_h3M/s1024/cover.jpeg"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgieXZo4iRk5jryGSPw4E5LNt-7CnQCY2chdBAKUVplU-QQDMyb50SbPdsOH8xFsRzhHLj42kGh-inI_KWNZC9l04nZ2Xbf9R_VdJi2XgLd_QUECqP_JjGTbNAxU3EV81pA8X1zeaR_h3M/s1024/cover.jpeg" /></a></div><h3>Atoms</h3><p>All atoms contain negative particles called electrons...</p>',
    'All atoms contain negative particles called electrons, which reside in different tiers or energy levels inside the atom. Carbon and silicon share similar chemical properties, but could silicon-based life ever exist?',
    'Turns out that carbon and silicon are not twins but brothers with differences, making silicon harder—maybe not impossible—to form life like its brother.',
    'systems',
    ARRAY['science', 'chemistry', 'silicon', 'carbon'],
    15,
    NULL,
    '{"image_url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgieXZo4iRk5jryGSPw4E5LNt-7CnQCY2chdBAKUVplU-QQDMyb50SbPdsOH8xFsRzhHLj42kGh-inI_KWNZC9l04nZ2Xbf9R_VdJi2XgLd_QUECqP_JjGTbNAxU3EV81pA8X1zeaR_h3M/s1024/cover.jpeg"}',
    false,
    false,
    true,
    '2021-05-26T06:52:00.003Z',
    '2021-05-26T05:22:00.000Z',
    '2021-05-26T07:15:00.000Z'
);

COMMIT;
