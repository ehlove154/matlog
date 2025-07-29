import '../common.js';

function formatDateLocal(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 모든 예약 데이터를 페이지 단위로 수집합니다.
async function fetchAllReservations() {
    let page = 1;
    let reservations = [];
    while (true) {
        const res = await fetch(`/user/myPage/reservations?page=${page}`);
        if (!res.ok) break;
        const data = await res.json();
        if (!data || data.result !== 'success') break;
        reservations = reservations.concat(data.reservations);
        if (page >= data.maxPage) break;
        page++;
    }
    return reservations;
}

/**
 * 월별 통계를 계산하고 DOM을 업데이트합니다.
 * @param {HTMLElement} wrapper - [data-mt-name="sessionMonthly"] 요소
 * @param {any[]} reservations - 예약 목록
 */
function computeAndRenderStats(wrapper, reservations) {
    const monthlyCounts = Array(12).fill(0);
    reservations.forEach(item => {
        if (!item.reservedAt) return;
        const date = new Date(item.reservedAt);
        const m = date.getMonth();
        monthlyCounts[m] += 1;
    });
    const BASE = 40;
    const barItems = wrapper.querySelectorAll('.axis_x .item');
    barItems.forEach((li, idx) => {
        const count = monthlyCounts[idx] || 0;
        const percent = Math.min(100, (count / BASE) * 100);
        li.dataset.count = count.toString();
        const bar = li.querySelector('.bar');
        if (bar) {
            bar.style.height = `${percent}%`;
        }
    });
    const totalCount = reservations.length;
    const totalCap = wrapper.querySelector('.total .caption');
    if (totalCap) totalCap.textContent = totalCount.toString();
    const weekCounts = {};
    reservations.forEach(item => {
        if (!item.reservedAt) return;
        const date = new Date(item.reservedAt);
        const day = date.getDay();
        const monday = new Date(date);
        monday.setDate(monday.getDate() - ((day + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const key = formatDateLocal(monday);
        weekCounts[key] = (weekCounts[key] || 0) + 1;
    });
    const weekKeys = Object.keys(weekCounts);
    const weeklyAvg = weekKeys.length ? Math.round(totalCount / weekKeys.length) : 0;
    const weeklyCap = wrapper.querySelector('.weekly .caption');
    if (weeklyCap) weeklyCap.textContent = weeklyAvg.toString();
    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const diff = monthlyCounts[currentMonth] - monthlyCounts[prevMonth];
    const variationCap = wrapper.querySelector('.variation .caption');
    const variationDesc = wrapper.querySelector('.variation .description');
    const variationIcon = wrapper.querySelector('.variation img.icon');
    if (variationCap && variationDesc && variationIcon) {
        if (diff > 0) {
            variationCap.textContent = diff.toString();
            variationDesc.textContent = '지난 달 대비 증가';
            variationIcon.src = '/assets/images/myPage/up.png';
        } else if (diff < 0) {
            variationCap.textContent = Math.abs(diff).toString();
            variationDesc.textContent = '지난 달 대비 감소';
            variationIcon.src = '/assets/images/myPage/down.png';
        } else {
            variationCap.textContent = '-';
            variationDesc.textContent = '지난 달 대비 증감';
            variationIcon.src = '/assets/images/myPage/dash.png';
        }
    }
}

/**
 * 표시 실패 시 UI를 리셋합니다.
 * @param {HTMLElement} wrapper
 */
function resetStatsUI(wrapper) {
    const barItems = wrapper.querySelectorAll('.axis_x .item');
    barItems.forEach(li => {
        li.dataset.count = '0';
        const bar = li.querySelector('.bar');
        if (bar) bar.style.height = '0';
    });
    const totalCap = wrapper.querySelector('.total .caption');
    if (totalCap) totalCap.textContent = '-';
    const weeklyCap = wrapper.querySelector('.weekly .caption');
    if (weeklyCap) weeklyCap.textContent = '-';
    const variationCap = wrapper.querySelector('.variation .caption');
    const variationDesc = wrapper.querySelector('.variation .description');
    const variationIcon = wrapper.querySelector('.variation img.icon');
    if (variationCap) variationCap.textContent = '-';
    if (variationDesc) variationDesc.textContent = '지난 달 대비 증감';
    if (variationIcon) variationIcon.src = '/assets/images/myPage/dash.png';
}

/**
 * 통계 섹션을 불러오고 통계 계산을 수행합니다.
 * 섹션이 아직 DOM에 없다면 일정 시간 후 다시 호출됩니다.
 */
async function loadSessionMonthly() {
    // 메뉴 항목(li)에도 같은 data-mt-name="sessionMonthly" 값이 있어 첫 번째 요소가 메뉴가 되는 문제가 있다.
    // 세션 통계 섹션은 div 요소이므로 div[data-mt-name="sessionMonthly"] 로 한정하여 선택한다.
    const wrapper = document.querySelector('div[data-mt-name="sessionMonthly"]');
    if (!wrapper) {
        setTimeout(loadSessionMonthly, 50);
        return;
    }
    try {
        const reservations = await fetchAllReservations();
        computeAndRenderStats(wrapper, reservations);
    } catch (e) {
        resetStatsUI(wrapper);
        dialog?.showSimpleOk('안내', '데이터 로딩에 실패했습니다.');
    }
}

// DOMContentLoaded 시점에 로드 함수 실행
// 모듈이 DOMContentLoaded 이후에 로드되면 이벤트가 이미 발송됐을 수 있으므로
// readyState 확인 후 즉시 호출한다.
document.addEventListener('DOMContentLoaded', loadSessionMonthly);
if (document.readyState !== 'loading') {
    loadSessionMonthly();
}
// 메뉴 클릭 시 외부에서 호출 가능하도록 전역으로 등록
window.loadSessionMonthly = loadSessionMonthly;