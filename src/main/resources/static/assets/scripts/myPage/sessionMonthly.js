import '../common.js';

{
    // sessionMonthly 영역이 화면에 표시될 때만 로직 수행
    const $wrapper = document.querySelector('[data-mt-name="sessionMonthly"]');
    if ($wrapper) {
        // 모든 예약 데이터를 페이지 단위로 수집
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

        // 통계를 계산하고 DOM을 업데이트
        function computeAndRenderStats(reservations) {
            const monthlyCounts = Array(12).fill(0);
            reservations.forEach(item => {
                if (!item.reservedAt) return;
                const date = new Date(item.reservedAt);
                const m = date.getMonth(); // 0=1월
                monthlyCounts[m] += 1;
            });

            // 1. 막대 그래프: 기준값 40회를 100%로 계산
            const BASE = 40;
            const barItems = $wrapper.querySelectorAll('.axis_x .item');
            barItems.forEach((li, idx) => {
                const count = monthlyCounts[idx] || 0;
                const percent = Math.min(100, (count / BASE) * 100);
                li.dataset.count = count.toString();
                const bar = li.querySelector('.bar');
                if (bar) {
                    bar.style.height = `${percent}%`;
                }
            });

            // 2. 총 세션 참여 횟수
            const totalCount = reservations.length;
            const totalCap = $wrapper.querySelector('.total .caption');
            if (totalCap) totalCap.textContent = totalCount.toString();

            // 3. 주간 평균 세션 참여 횟수 계산
            const weekCounts = {};
            reservations.forEach(item => {
                if (!item.reservedAt) return;
                const date = new Date(item.reservedAt);
                // 월요일을 기준으로 주별 키 생성
                const day = date.getDay(); // 0=일~6=토
                const monday = new Date(date);
                monday.setDate(monday.getDate() - ((day + 6) % 7));
                monday.setHours(0, 0, 0, 0);
                const key = monday.toISOString().split('T')[0];
                weekCounts[key] = (weekCounts[key] || 0) + 1;
            });
            const weekKeys = Object.keys(weekCounts);
            const weeklyAvg = weekKeys.length ? Math.round(totalCount / weekKeys.length) : 0;
            const weeklyCap = $wrapper.querySelector('.weekly .caption');
            if (weeklyCap) weeklyCap.textContent = weeklyAvg.toString();

            // 4. 지난 달 대비 증감 계산
            const now = new Date();
            const currentMonth = now.getMonth();
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const diff = monthlyCounts[currentMonth] - monthlyCounts[prevMonth];

            const variationCap = $wrapper.querySelector('.variation .caption');
            const variationDesc = $wrapper.querySelector('.variation .description');
            const variationIcon = $wrapper.querySelector('.variation img.icon');
            if (variationCap && variationDesc && variationIcon) {
                if (diff > 0) {
                    // 증가한 경우
                    variationCap.textContent = diff.toString();
                    variationDesc.textContent = '지난 달 대비 증가';
                    variationIcon.src = '/assets/images/myPage/up.png';
                } else if (diff < 0) {
                    // 감소한 경우
                    variationCap.textContent = Math.abs(diff).toString();
                    variationDesc.textContent = '지난 달 대비 감소';
                    variationIcon.src = '/assets/images/myPage/down.png';
                } else {
                    // 동일한 경우
                    variationCap.textContent = '-';
                    variationDesc.textContent = '지난 달 대비 증감';
                    variationIcon.src = '/assets/images/myPage/dash.png';
                }
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            fetchAllReservations().then(reservations => {
                computeAndRenderStats(reservations);
            });
        });

        // ↓↓↓ 전역 함수 등록: 메뉴에서 월별 통계 탭을 클릭할 때 호출
        window.loadSessionMonthly = () => {
            fetchAllReservations().then(reservations => {
                computeAndRenderStats(reservations);
            });
        };

        // 페이지 로드 시 데이터 수집 후 렌더링
        // fetchAllReservations().then(reservations => {
        //     computeAndRenderStats(reservations);
        // }).catch(() => {
        //     console.error('예약 데이터를 불러오지 못했습니다.');
        // });
    }
}
