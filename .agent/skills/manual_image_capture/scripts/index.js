import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Module 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 저장 경로 설정 (프로젝트 루트/src/md/images) -> ../../../../src/md/images
// .agent/skills/manual_image_capture/scripts/index.js 위치 기준
const SAVE_DIR = path.resolve(__dirname, '../../../../src/md/images');
const BASE_URL = 'http://localhost:5173';

// 캡처할 대상 정의
const SCENARIOS = [
    // --- 1. 투자관리 ---
    {
        name: '투자관리_조회',
        url: '/investment',
        action: async (page) => {
            await clickButtonByText(page, '투자내역조회');
        },
        filename: '01_investment_list_mockup.png'
    },
    {
        name: '투자관리_등록',
        url: '/investment',
        action: async (page) => {
            await clickButtonByText(page, '투자항목 추가');
        },
        filename: '02_add_investment_form_mockup.png'
    },
    {
        name: '투자관리_계좌',
        url: '/investment',
        action: async (page) => {
            await clickButtonByText(page, '계좌 관리(코드)');
        },
        filename: '03_account_management_mockup.png'
    },
    {
        name: '투자관리_설정',
        url: '/investment',
        action: async (page) => {
            await clickButtonByText(page, '연동설정');
        },
        filename: '04_connection_settings_mockup.png'
    },

    // --- 2. 기준정보관리 ---
    {
        name: '기준정보_공통코드',
        url: '/codes',
        action: async (page) => {
            await clickButtonByText(page, '공통 코드');
        },
        filename: '01_code_management_mockup.png'
    },
    {
        name: '기준정보_메뉴',
        url: '/codes',
        action: async (page) => {
            await clickButtonByText(page, '메뉴 관리');
        },
        filename: '02_menu_management_mockup.png'
    },
    {
        name: '기준정보_권한',
        url: '/codes',
        action: async (page) => {
            await clickButtonByText(page, '권한 관리');
        },
        filename: '03_permission_management_mockup.png'
    }
];

// Helper: Click button by text (using XPath - compatible with latest Puppeteer)
async function clickButtonByText(page, text) {
    try {
        const xpaths = [
            `//button[contains(., '${text}')]`,
            `//a[contains(., '${text}')]`,
            `//*[contains(@role, 'button') and contains(., '${text}')]`,
            `//span[contains(., '${text}')]`,
            `//div[contains(., '${text}')]`
        ];

        let element;
        for (const xpath of xpaths) {
            let elements = [];
            try {
                // Try modern syntax first
                elements = await page.$$(`xpath/${xpath}`);
            } catch (e) {
                // Fallback for older/different versions
                elements = await page.evaluateHandle((xp) => {
                    const result = document.evaluate(xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    const nodes = [];
                    for (let i = 0; i < result.snapshotLength; i++) {
                        nodes.push(result.snapshotItem(i));
                    }
                    return nodes;
                }, xpath).then(handle => handle.getProperties().then(maps => Array.from(maps.values())));
            }

            if (elements.length > 0) {
                for (const el of elements) {
                    if (el.isVisible && await el.isVisible()) {
                        element = el;
                        break;
                    }
                }
            }
            if (element) break;
        }

        if (element) {
            await element.click();
            await new Promise(r => setTimeout(r, 800));
        } else {
            console.warn(`⚠️ 버튼 클릭 실패 [${text}]: 요소를 찾을 수 없습니다.`);
        }
    } catch (e) {
        console.warn(`⚠️ 버튼 클릭 오류 [${text}]:`, e);
    }
}

async function run() {
    console.log('📸 [Stitch] 매뉴얼 이미지 자동 캡처 시작...');

    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        // 1. 보호된 라우트(/investment)로 바로 접속 시도 -> 리다이렉트 유도
        const targetUrl = `${BASE_URL}/investment`;
        console.log(`🌐 접속 시도: ${targetUrl}`);
        await page.goto(targetUrl);

        // 2. 로그인 여부 판단 (Race Condition)
        console.log('⏳ 로그인 상태 식별 중...');

        try {
            const result = await Promise.race([
                page.waitForSelector('input[type="email"]', { timeout: 5000 }).then(() => 'LOGIN_NEEDED'),
                page.waitForSelector('nav', { timeout: 5000 }).then(() => 'LOGGED_IN'),
                page.waitForFunction(() => document.body.innerText.includes('투자관리'), { timeout: 5000 }).then(() => 'LOGGED_IN')
            ]);

            if (result === 'LOGIN_NEEDED') {
                console.log('🔒 [로그인 필요] 로그인 화면이 감지되었습니다.');
                console.log('👉 브라우저에서 직접 로그인을 진행해주세요! (로그인이 완료되면 자동으로 캡처를 시작합니다)');

                await page.waitForSelector('nav', { timeout: 0 }); // 무한 대기

                console.log('✅ 로그인 성공 감지! 3초 후 캡처를 시작합니다...');
                await new Promise(r => setTimeout(r, 3000));
            } else {
                console.log('✅ 이미 로그인 상태입니다 (메인 화면 감지됨).');
            }

        } catch (e) {
            console.warn('⚠️ 상태 식별 시간 초과 또는 오류 (로그인/메인 요소 못 찾음). 진행합니다.');
        }

        // 3. 시나리오 순회
        for (const scenario of SCENARIOS) {
            console.log(`📸 촬영 중: ${scenario.name}...`);

            if (!page.url().includes(scenario.url)) {
                await page.goto(`${BASE_URL}${scenario.url}`, { waitUntil: 'networkidle2' });
                await new Promise(r => setTimeout(r, 1500)); 
            }

            if (scenario.action) {
                await scenario.action(page);
            }

            const filePath = path.join(SAVE_DIR, scenario.filename);
            await page.screenshot({ path: filePath, fullPage: false });
            console.log(`   └─ 저장됨: ${scenario.filename}`);
        }

        console.log('🎉 모든 캡처가 완료되었습니다!');
        console.log(`📂 저장 위치: ${SAVE_DIR}`);

    } catch (e) {
        console.error('❌ 오류 발생:', e);
    } finally {
        await browser.close();
    }
}

run();
