/* ==============================================================
       장면 1 (대기화면: 꽃 3송이 살랑임, 마우스 이동 시 슬라이드업 전환)
       ============================================================== */
    window.SCENES = window.SCENES || {};
    window.SCENES[1] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/01.png" alt="">
          <div class="flower f1"><img src="02_motions/01 Delphinium 1 (x979.08 y163.95)).png" alt=""></div>
          <div class="flower f2"><img src="02_motions/01 Delphinium 2 (x962.99 y425.21)).png" alt=""></div>
          <div class="flower f3"><img src="02_motions/01 Delphinium 3 (x998.87 y597.38)).png" alt=""></div>
        `;

        // 진입 직후의 미세한 마우스 움직임은 무시
        let armed = false;
        const armTimer = setTimeout(() => (armed = true), 600);

        const onTrigger = () => {
          if (!armed) return;
          cleanup();
          app.goTo(2, 'slideUp');
        };

        const cleanup = () => {
          clearTimeout(armTimer);
          removeEventListener('mousemove', onTrigger);
          removeEventListener('pointerdown', onTrigger);
        };

        addEventListener('mousemove', onTrigger);
        addEventListener('pointerdown', onTrigger);

        return {
          unmount: cleanup,
        };
      },
    };

    /* ==============================================================
       장면 2 (비 내리는 책방: 12.5fps 빗줄기, 타이핑 문구, 클릭 시 글자 흩어짐)
       ============================================================== */
    window.SCENES[2] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/02.png" alt="">
          <div class="sign-fixed"><img src="02_motions/sign_fixed.png" alt=""></div>
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="veil"></div>
          <p class="guide-text"></p>
        `;

        const stopRain = startRain(el.querySelector('.rain'));
        const veil = el.querySelector('.veil');
        const textEl = el.querySelector('.guide-text');
        const typing = typeText(textEl, [
          '마우스 왼쪽 버튼을 눌러 이야기를 이어가세요.',
          '오른쪽 버튼을 누르면 이전 장면으로 돌아갑니다.',
        ]);

        // 2장면 진행 단계 (0: 텍스트/필터 상태 -> 1번째 클릭 시 페이드아웃 및 대기 -> 2번째 클릭 시 3장면 전환)
        let phase = 0;
        let lastClickTime = 0;
        const onClick = (e) => {
          if (e.button !== 0) return;
          const now = performance.now();

          if (phase === 0) {
            // [1번째 클릭] 타이핑 즉시 완료 및 보라색 필터 레이어 + 텍스트가 0%로 서서히 페이드아웃
            phase = 1;
            lastClickTime = now;
            typing.finish();
            veil.classList.add('gone');
            textEl.classList.add('gone');
            // 필터가 걷힌 깨끗한 비 내리는 책방 배경을 유지하며 다음 클릭 대기
          } else if (phase === 1) {
            // [2번째 클릭] 대화창이 있는 3번 장면으로 이동! (연속 클릭 방지 최소 350ms 대기)
            if (now - lastClickTime < 350) return;
            phase = 2;
            app.goTo(3, 'fade');
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 3 (책방 앞: 초록 대화창 & You: 대사 타이핑)
       ============================================================== */
    window.SCENES[3] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/03.png" alt="">
          <div class="sign-fixed"><img src="02_motions/sign_fixed.png" alt=""></div>
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="dialog-wrap">
            <img class="dialog-bg" src="02_motions/03 ,05, 07, 13, 36 Green text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 3장면: 배경 요소(건물, 바닥 등)가 상단으로 이동한 만큼 빗줄기 마스킹도 -85px 상향 이동
        const stopRain = startRain(el.querySelector('.rain'), { offsetY: -85 });
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');

        // You: (#308DA4) 와 나머지 대사(#FFFAE1) 순차 타이핑
        const typing = typeDialog(
          speakerEl,
          'You: ',
          bodyEl,
          '으으 추워... 저기인가?',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // 다음 장면(4장면 등)으로 이어갈 수 있도록 준비
            app.next('fade');
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 4 (노크 장면: 4번 배경, door 슬라이드, arm 마우스 커서, 초록 대화창)
       ============================================================== */
    window.SCENES[4] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/05, 06 background.png" alt="">
          <div class="flowers-layer">
            <div class="flower-strip left"><img src="01_backgrounds/03.png" alt=""></div>
            <div class="flower-strip right"><img src="01_backgrounds/03.png" alt=""></div>
          </div>
          <div class="sign-fixed"><img src="02_motions/sign_fixed.png" alt=""></div>
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="door">
            <img src="02_motions/06 door Day .png" alt="">
          </div>
          <div class="dialog-wrap purple knock-dialog">
            <img class="dialog-bg" src="02_motions/04 Purple text background .png" alt="">
            <div class="dialog-text">
              <span class="dialog-body knock-guide"></span>
            </div>
          </div>
          <div class="arm-cursor">
            <img src="02_motions/R arm(04, 43).png" alt="">
          </div>
          <div class="dialog-wrap green" style="display: none;">
            <img class="dialog-bg" src="02_motions/03 ,05, 07, 13, 36 Green text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 비내리는 연출: 3번 장면과 동일 (offsetY: -85)
        const stopRain = startRain(el.querySelector('.rain'), { offsetY: -85 });

        const doorEl = el.querySelector('.door');
        const doorImg = doorEl.querySelector('img');
        const armEl = el.querySelector('.arm-cursor');
        const knockDialog = el.querySelector('.knock-dialog');
        const guideEl = knockDialog.querySelector('.knock-guide');
        const greenDialogWrap = el.querySelector('.dialog-wrap.green');
        const speakerEl = greenDialogWrap.querySelector('.speaker');
        const bodyEl = greenDialogWrap.querySelector('.dialog-body');
        let dialogTyping = null;

        // PNG 파일의 원본 크기와 종횡비(가로세로 비율)를 100% 온전하게 보존
        const applyDoorNaturalSize = () => {
          if (!doorImg.naturalWidth) return;
          const scale = doorImg.naturalWidth > 400 ? 0.5 : 1.0;
          doorImg.style.width = (doorImg.naturalWidth * scale) + 'px';
          doorImg.style.height = 'auto'; // 세로 비율 왜곡 방지
        };
        if (doorImg.complete) {
          applyDoorNaturalSize();
        } else {
          doorImg.addEventListener('load', applyDoorNaturalSize, { once: true });
        }

        // 안내 대사 타이핑: '문을 클릭해 노크하세요.' (퍼플 대화창 공통 비율/높이 적용)
        const typing = typeText(guideEl, ['문을 클릭해 노크하세요.'], 45, 300);

        // arm 마우스 커서 추적 (RAF 부드러운 감쇠 보간 + 캐시된 rect로 버벅임 완전 제거)
        const stage = document.getElementById('stage');
        let stageRect = stage.getBoundingClientRect();
        const updateRect = () => { stageRect = stage.getBoundingClientRect(); };
        window.addEventListener('resize', updateRect);

        let targetX = 1120, targetY = 500;
        let currentX = 1120, currentY = 500;
        let armRaf = 0;

        const onMouseMove = (e) => {
          if (armEl.style.display === 'none') return;
          const scale = stageRect.width / 1366;
          const stageX = (e.clientX - stageRect.left) / scale;
          const stageY = (e.clientY - stageRect.top) / scale;

          // 팔 크기(1230x1290)에 맞춰 하단 잘린 단면이 1366x1024 뷰포트에 절대 노출되지 않도록 가동 범위 정밀 제한
          const minY = stageX < 740 ? 130 + (740 - stageX) * 0.4 : 120;
          targetX = Math.max(520, Math.min(1150, stageX));
          targetY = Math.max(minY, Math.min(760, stageY));
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        const renderArm = () => {
          if (armEl.style.display !== 'none') {
            // 부드러운 감쇠 보간(lerp)으로 마우스 센서 떨림 및 끊김 현상 없이 유려하게 추종
            currentX += (targetX - currentX) * 0.35;
            currentY += (targetY - currentY) * 0.35;
            armEl.style.left = currentX.toFixed(2) + 'px';
            armEl.style.top = currentY.toFixed(2) + 'px';
            armRaf = requestAnimationFrame(renderArm);
          }
        };
        armRaf = requestAnimationFrame(renderArm);

        // 노크 동작 트리거: 주먹 노크 모션 + 우드 효과음 + 문 슬라이딩 오픈 및 초록 대화창 등장
        let phase = 'WAIT_KNOCK'; // 'WAIT_KNOCK' -> 'KNOCKING' -> 'DOOR_OPENING'
        let openTimer = null;

        function triggerKnock() {
          if (phase !== 'WAIT_KNOCK') return;
          phase = 'KNOCKING';

          // 안내 타이핑 즉시 완료
          typing.finish();

          // 노크 움직임 & 리얼 우드 노크 사운드 동시 재생
          armEl.classList.remove('knocking');
          void armEl.offsetWidth; // reflow
          armEl.classList.add('knocking');
          playKnockSound();

          // 노크 모션(550ms) 완료 후 0.7초 대기(총 1250ms: 기존 1550ms 대비 0.3초 빠르게 시작) 뒤 문이 열리기 시작
          openTimer = setTimeout(() => {
            phase = 'DOOR_OPENING';

            // 1. 문 슬라이딩 오픈 시작 (x619.24 -> x378.03, 2.0s 속도로 슬라이딩)
            doorEl.classList.add('opened');

            // 2. 팔 그래픽 제거 및 커서 복원, 퍼플 대화창 숨김
            armEl.style.display = 'none';
            el.style.cursor = 'default';
            knockDialog.style.display = 'none';

            // 3. 최상단 레이어에 초록 대화창 등장
            greenDialogWrap.style.display = 'block';

            // 4. 슬라이딩 속도(2초)에 맞춰 You: 및 대사 순차 타이핑 한 번에 진행
            dialogTyping = typeDialog(
              speakerEl,
              'You: ',
              bodyEl,
              '바로 열리네- (기다리고 있었나?)',
              55,
              150,
              { dimParen: true }
            );
          }, 1250);
        }

        const handleClick = (e) => {
          if (e.button !== 0) return;

          if (phase === 'WAIT_KNOCK') {
            const scale = stageRect.width / 1366;
            const sx = (e.clientX - stageRect.left) / scale;
            const sy = (e.clientY - stageRect.top) / scale;
            if (sx >= 580 && sx <= 920 && sy >= 80 && sy <= 760) {
              triggerKnock();
            } else if (!typing.isFinished()) {
              typing.finish();
            }
          } else if (phase === 'KNOCKING') {
            return;
          } else if (phase === 'DOOR_OPENING') {
            if (dialogTyping && !dialogTyping.isFinished()) {
              dialogTyping.finish();
            } else {
              app.next('fade');
            }
          }
        };

        const onDoorClick = (e) => {
          if (e.button !== 0) return;
          if (phase === 'WAIT_KNOCK') {
            e.stopPropagation();
            triggerKnock();
          }
        };
        doorEl.addEventListener('click', onDoorClick);
        el.addEventListener('click', handleClick);

        return {
          unmount() {
            clearTimeout(openTimer);
            cancelAnimationFrame(armRaf);
            stopRain();
            typing.stop();
            if (dialogTyping) dialogTyping.stop();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', updateRect);
            doorEl.removeEventListener('click', onDoorClick);
            el.removeEventListener('click', handleClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 5 (비둘기 방 + 슬라이딩된 문 유지 + 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[5] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/05, 06 background.png" alt="">
          <div class="flowers-layer">
            <div class="flower-strip left"><img src="01_backgrounds/03.png" alt=""></div>
            <div class="flower-strip right"><img src="01_backgrounds/03.png" alt=""></div>
          </div>
          <div class="sign-fixed"><img src="02_motions/sign_fixed.png" alt=""></div>
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="door">
            <img src="02_motions/06 door Day .png" alt="">
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 이전 장면과 동일한 빗줄기 연출 (offsetY: -85)
        const stopRain = startRain(el.querySelector('.rain'), { offsetY: -85 });

        // 문 원본 크기 및 종횡비 보존 (x: 378.03px, y: 97.91px 슬라이딩 위치 유지)
        const doorImg = el.querySelector('.door img');
        const setupDoor = () => {
          if (!doorImg.naturalWidth) return;
          const scale = doorImg.naturalWidth > 400 ? 0.5 : 1.0;
          doorImg.style.width = (doorImg.naturalWidth * scale) + 'px';
          doorImg.style.height = 'auto';
        };
        if (doorImg.complete) setupDoor();
        else doorImg.addEventListener('load', setupDoor, { once: true });

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '오랜만에 찾아온 손님이군요. 반갑습니다.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // 다음 장면(6번 등)으로 이어갈 수 있도록 준비
            app.next('fade');
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 6 (비둘기 방 + 슬라이딩된 문 유지 + 그린 대화창: You: 대사 타이핑)
       ============================================================== */
    window.SCENES[6] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/05, 06 background.png" alt="">
          <div class="flowers-layer">
            <div class="flower-strip left"><img src="01_backgrounds/03.png" alt=""></div>
            <div class="flower-strip right"><img src="01_backgrounds/03.png" alt=""></div>
          </div>
          <div class="sign-fixed"><img src="02_motions/sign_fixed.png" alt=""></div>
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="door">
            <img src="02_motions/06 door Day .png" alt="">
          </div>
          <div class="dialog-wrap green">
            <img class="dialog-bg" src="02_motions/03 ,05, 07, 13, 36 Green text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 이전 장면과 동일한 빗줄기 연출 (offsetY: -85)
        const stopRain = startRain(el.querySelector('.rain'), { offsetY: -85 });

        // 문 원본 크기 및 종횡비 보존 (x: 378.03px, y: 97.91px 슬라이딩 위치 유지)
        const doorImg = el.querySelector('.door img');
        const setupDoor = () => {
          if (!doorImg.naturalWidth) return;
          const scale = doorImg.naturalWidth > 400 ? 0.5 : 1.0;
          doorImg.style.width = (doorImg.naturalWidth * scale) + 'px';
          doorImg.style.height = 'auto';
        };
        if (doorImg.complete) setupDoor();
        else doorImg.addEventListener('load', setupDoor, { once: true });

        // 그린 텍스트 규칙: You: (#308DA4) / 대사 (#FFFAE1, 괄호 부분 투명도 30%)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'You: ',
          bodyEl,
          '아... 네! 안녕하세요! (비둘기다...)',
          45,
          350,
          { dimParen: true }
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // 다음 장면으로 이어갈 수 있도록 준비
            app.next('fade');
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 7 (비둘기 클로즈업 1: 08.png, 날개 날갯짓, 배경 대화창 활용)
       ============================================================== */
    window.SCENES[7] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/08.png" alt="">
          <div class="pigeon-wing left">
            <img src="02_motions/L wing (x313.35 y278.26).png" alt="">
          </div>
          <div class="pigeon-wing right">
            <img src="02_motions/R wing (x313.5 y278.15).png" alt="">
          </div>
          <div class="dialog-wrap red">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '아침부터 줄곧 비가 내리더군요.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 8 (비둘기 클로즈업 2: 09.png, 날개 날갯짓, 배경 대화창 활용)
       ============================================================== */
    window.SCENES[8] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/09.png" alt="">
          <div class="pigeon-wing left">
            <img src="02_motions/L wing (x313.35 y278.26).png" alt="">
          </div>
          <div class="pigeon-wing right">
            <img src="02_motions/R wing (x313.5 y278.15).png" alt="">
          </div>
          <div class="dialog-wrap red">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '그래서 좋은 소식이라도 찾아오려나, 기다렸답니다.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 9 (비둘기 클로즈업 3: 10.png, 날개 날갯짓, 배경 대화창 활용)
       ============================================================== */
    window.SCENES[9] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/10.png" alt="">
          <div class="pigeon-wing left">
            <img src="02_motions/L wing (x313.35 y278.26).png" alt="">
          </div>
          <div class="pigeon-wing right">
            <img src="02_motions/R wing (x313.5 y278.15).png" alt="">
          </div>
          <div class="dialog-wrap red">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '그런데 정말로 손님께서 와 주시다니... 놀랍군요.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 10 (비둘기 클로즈업 4: 11.png, 날개 날갯짓, 그린 대화창 활용)
       ============================================================== */
    window.SCENES[10] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/11.png" alt="">
          <div class="pigeon-wing left">
            <img src="02_motions/L wing (x313.35 y278.26).png" alt="">
          </div>
          <div class="pigeon-wing right">
            <img src="02_motions/R wing (x313.5 y278.15).png" alt="">
          </div>
          <div class="dialog-wrap green">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'You: ',
          bodyEl,
          '(별 생각 없이 온 건데 뭔가 미안해지네...)',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 11 (비둘기 방 + 슬라이딩된 문 유지 + 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[11] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/05, 06 background.png" alt="">
          <div class="flowers-layer">
            <div class="flower-strip left"><img src="01_backgrounds/03.png" alt=""></div>
            <div class="flower-strip right"><img src="01_backgrounds/03.png" alt=""></div>
          </div>
          <div class="sign-fixed"><img src="02_motions/sign_fixed.png" alt=""></div>
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="door">
            <img src="02_motions/06 door Day .png" alt="">
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 5장면과 완전히 동일한 빗줄기 연출 (offsetY: -85)
        const stopRain = startRain(el.querySelector('.rain'), { offsetY: -85 });

        // 문 원본 크기 및 종횡비 보존 (x: 378.03px, y: 97.91px 슬라이딩 위치 유지)
        const doorImg = el.querySelector('.door img');
        const setupDoor = () => {
          if (!doorImg.naturalWidth) return;
          const scale = doorImg.naturalWidth > 400 ? 0.5 : 1.0;
          doorImg.style.width = (doorImg.naturalWidth * scale) + 'px';
          doorImg.style.height = 'auto';
        };
        if (doorImg.complete) setupDoor();
        else doorImg.addEventListener('load', setupDoor, { once: true });

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '자, 비도 오는데 얼른 안으로 들어오시죠.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 12 (주인공 human 클로즈업 + 빗줄기 배경 + 초록 대화창: You: 대사 타이핑)
       ============================================================== */
    window.SCENES[12] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/13.png" alt="">
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="human">
            <img src="02_motions/13 human.png" alt="">
          </div>
          <div class="dialog-wrap green">
            <img class="dialog-bg" src="02_motions/03 ,05, 07, 13, 36 Green text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 12.5fps 빗줄기 전면 애니메이션 (마스킹 없이 뒷배경에 자연스럽게 내림)
        const stopRain = startRain(el.querySelector('.rain'), { noMask: true });

        // 그린 텍스트 규칙: You: (#308DA4) / 대사 (#FFFAE1, 48px, DungGeunMo, 괄호 투명도 30%)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'You: ',
          bodyEl,
          '읏차, 그럼 실례하겠습니다아... (드디어!)',
          45,
          350,
          { dimParen: true }
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 13 (비 내리는 창가 비둘기 씬 + 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[13] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/14 raining background.png" alt="">
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="pigeon-room">
            <img src="02_motions/14 pigeon.png" alt="">
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 12.5fps 빗줄기 애니메이션 (창문 밖 배경에 자연스럽게 내리며 방 전경이 앞을 가려 창문 영역으로만 비가 보임)
        const stopRain = startRain(el.querySelector('.rain'), { noMask: true });

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '오늘 이 만남은 하늘이 내려 준 인연인가 싶습니다.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 14 (비 내리는 창가 비둘기 씬 2 + 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[14] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/14 raining background.png" alt="">
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="pigeon-room">
            <img src="02_motions/15 pigeon.png" alt="">
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 12.5fps 빗줄기 애니메이션 (창문 밖 배경에 자연스럽게 내리며 방 전경이 앞을 가려 창문 영역으로만 비가 보임)
        const stopRain = startRain(el.querySelector('.rain'), { noMask: true });

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '비의 꽃, 비비추의 꽃말처럼 말이죠...',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 15 (비 내리는 창가 비둘기 씬 3 + 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[15] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/14 raining background.png" alt="">
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="pigeon-room">
            <img src="02_motions/16 pigeon.png" alt="">
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 12.5fps 빗줄기 애니메이션 (창문 밖 배경에 자연스럽게 내리며 방 전경이 앞을 가려 창문 영역으로만 비가 보임)
        const stopRain = startRain(el.querySelector('.rain'), { noMask: true });

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '손님의 방문이 제겐 가뭄 속 단비같은 기쁨입니다.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 16 (인물 클로즈업 땀 삐질 씬 + 그린 대화창: You: 대사 타이핑)
       ============================================================== */
    window.SCENES[16] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/17_human_closeup.png" alt="">
          <div class="sweat-group"><img src="02_motions/sweat.svg" alt=""></div>
          <div class="dialog-wrap green">
            <img class="dialog-bg" src="02_motions/03 ,05, 07, 13, 36 Green text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'You: ',
          bodyEl,
          '으앗... (도대체 언제 들여보내 주려는 걸까?)',
          45,
          350,
          { dimParen: true }
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 17 (비 내리는 창가 비둘기 씬 4 + 하단 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[17] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/18_night_bg.png" alt="">
          <canvas class="rain" width="1366" height="1024"></canvas>
          <div class="pigeon-room">
            <img src="02_motions/18_pigeon.png" alt="">
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 12.5fps 빗줄기 애니메이션
        const stopRain = startRain(el.querySelector('.rain'), { noMask: true });

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '...그만 올라가시죠. 안내해 드리겠습니다.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            stopRain();
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 18 (계단 날아오르는 비둘기 뒷모습 씬 + 하단 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[18] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/19_stairs.png" alt="">
          <div class="pigeon-climber">
            <div class="wing left"><img src="02_motions/19_pigeon_lwing.png" alt=""></div>
            <div class="body"><img src="02_motions/19_pigeon_body.png" alt=""></div>
            <div class="wing right"><img src="02_motions/19_pigeon_rwing.png" alt=""></div>
          </div>
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '어찌 알고 오셨는지는 모르겠지만, 잘 오셨습니다.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ==============================================================
       장면 19 (서점 안 비둘기 클로즈업 씬 + 하단 레드 대화창: P: 대사 타이핑)
       ============================================================== */
    window.SCENES[19] = {
      mount(el, app) {
        el.innerHTML = `
          <img class="bg" src="01_backgrounds/20.svg" alt="">
          <div class="dialog-wrap red">
            <img class="dialog-bg" src="02_motions/06 Red text background .png" alt="">
            <div class="dialog-text">
              <span class="speaker"></span>
              <span class="dialog-body"></span>
            </div>
          </div>
        `;

        // 레드 텍스트 규칙: P: (#D13D79) / 대사 (#FFFAE1, 48px, DungGeunMo)
        const speakerEl = el.querySelector('.speaker');
        const bodyEl = el.querySelector('.dialog-body');
        const typing = typeDialog(
          speakerEl,
          'P: ',
          bodyEl,
          '비 오는 날과 어울리는 책을 잔뜩 추천해드리죠.',
          45,
          350
        );

        const onClick = (e) => {
          if (e.button !== 0) return;
          if (!typing.isFinished()) {
            typing.finish();
          } else {
            // S1 종료 후 2화(S2.html)로 자연스럽게 이동
            location.href = 'S2.html';
          }
        };
        el.addEventListener('click', onClick);

        return {
          unmount() {
            typing.stop();
            el.removeEventListener('click', onClick);
          },
        };
      },
    };

    /* ---------- 웹 오디오 노크 효과음 합성 재생 (똑-똑) ---------- */
    function playKnockSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        function singleKnock(time, freq) {
          // 1. 우드 바디 공명음 (삼각파 피치 드롭)
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.25, time + 0.09);

          oscGain.gain.setValueAtTime(0.85, time);
          oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

          osc.connect(oscGain);
          oscGain.connect(ctx.destination);

          osc.start(time);
          osc.stop(time + 0.09);

          // 2. 주먹 타격 임팩트 (노이즈 버스트)
          const bufferSize = Math.floor(ctx.sampleRate * 0.025);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'lowpass';
          noiseFilter.frequency.setValueAtTime(900, time);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.95, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.025);

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.025);
        }

        const now = ctx.currentTime;
        singleKnock(now + 0.16, 175); // 첫 번째 똑
        singleKnock(now + 0.38, 165); // 두 번째 똑
      } catch (e) {
        console.warn('Knock sound error:', e);
      }
    }

    /* ---------- 타이핑 모션 (커튼콜 1.6s 완료 후 1.7s 시점 등장, 32ms 빠른 속도) ---------- */
    function typeText(el, lines, speed = 32, startDelay = 1700) {
      const chars = [];
      lines.forEach((line, li) => {
        if (li) el.appendChild(document.createElement('br'));
        for (const c of line) {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c === ' ' ? '\u00A0' : c;
          el.appendChild(s);
          chars.push(s);
        }
      });

      let i = 0, timer = 0;
      const step = () => {
        if (i >= chars.length) return;
        chars[i++].classList.add('on');
        timer = setTimeout(step, speed);
      };
      timer = setTimeout(step, startDelay);

      return {
        finish() { clearTimeout(timer); chars.forEach((c) => c.classList.add('on')); i = chars.length; },
        stop() { clearTimeout(timer); },
      };
    }

    /* ---------- 대사 타이핑 모션 (화자 + 대사 순차 출력, 괄호는 항상 투명도 30% 기본 적용) ---------- */
    function typeDialog(speakerEl, speakerText, bodyEl, bodyText, speed = 45, startDelay = 400, options = {}) {
      const chars = [];
      const dimParen = options.dimParen !== false; // 기본값 true: 대사 중 괄호 부분은 항상 투명도 30% 적용

      // 화자 (You: / P:)
      for (const c of speakerText) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c === ' ' ? '\u00A0' : c;
        speakerEl.appendChild(s);
        chars.push(s);
      }

      // 대사 내용 (괄호 안팎 텍스트 투명도 30% 자동 적용)
      let inParen = false;
      for (const c of bodyText) {
        if (dimParen && c === '(') inParen = true;
        const s = document.createElement('span');
        s.className = (dimParen && inParen) ? 'ch dim' : 'ch';
        s.textContent = c === ' ' ? '\u00A0' : c;
        bodyEl.appendChild(s);
        chars.push(s);
        if (dimParen && c === ')') inParen = false;
      }

      let i = 0, timer = 0;
      let finished = false;

      const step = () => {
        if (i >= chars.length) {
          finished = true;
          return;
        }
        chars[i++].classList.add('on');
        timer = setTimeout(step, speed);
      };
      timer = setTimeout(step, startDelay);

      return {
        isFinished: () => finished,
        finish() {
          clearTimeout(timer);
          chars.forEach((c) => c.classList.add('on'));
          i = chars.length;
          finished = true;
        },
        stop() {
          clearTimeout(timer);
        },
      };
    }

    /* ---------- 빗줄기 애니메이션 (12.5fps 스톱모션, png 기본값 + 미세한 개별 각도 편차) ---------- */
    function startRain(canvas, options = {}) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const img = new Image();
      img.src = '02_motions/02-07, 12-13 rain line .png';

      const BASE_W = 45, BASE_H = 59.5;
      const BASE_LEAN = Math.atan2(90, 119); // 약 37.1도 왼쪽 기울기
      const SPEED = 12;

      // 배경 요소의 상단 이동 오프셋 (2장면: 0, 3~6, 11장면: -85px)
      const noMask = options.noMask === true;
      const offsetY = options.offsetY ?? 0;
      const buildingLeft = 379;
      const buildingRight = 899;
      const signLeft = 898;
      const signRight = 1015;
      const buildingTop = 165 + offsetY;
      const buildingBottom = 840 + offsetY;
      const signTop = 205 + offsetY;
      const signBottom = 516 + offsetY;
      const bottomY = 825 + offsetY;

      // 화면에 자연스럽게 내리는 적정 수량 (약 60개)
      const COUNT = 60;
      const TOTAL_SPAN = W + 700; // -100 ~ W+600
      const START_X = -100;

      // 평행 궤적(lineX) 상에서 서로 겹치지 않도록 최소 이격 거리 검증하며 배치
      const drops = [];
      const MIN_DX = 24;  // 가로 궤적 최소 간격 (겹침 방지)
      const MIN_DY = 130; // 동일/인접 궤적 간의 세로 최소 간격

      for (let i = 0; i < COUNT; i++) {
        let bestX = 0, bestY = 0;
        let found = false;

        for (let attempt = 0; attempt < 80; attempt++) {
          const testX = START_X + Math.random() * TOTAL_SPAN;
          const testY = Math.random() * (H + BASE_H * 2) - BASE_H;

          // 기존 빗줄기들과 겹치는지 체크
          const overlapped = drops.some((d) => {
            const dx = Math.abs(d.originX - testX);
            const dy = Math.abs(d.y - testY);
            return dx < MIN_DX && dy < MIN_DY;
          });

          if (!overlapped) {
            bestX = testX;
            bestY = testY;
            found = true;
            break;
          }
        }

        if (!found) {
          bestX = START_X + (i / COUNT) * TOTAL_SPAN;
          bestY = Math.random() * (H + BASE_H * 2) - BASE_H;
        }

        // 개별적으로 아주 살짝 다르게 적용되는 미세 회전각 (약 -4도 ~ +4도 편차)
        const rotJitter = (Math.random() - 0.5) * (8 * Math.PI / 180);
        const actualLean = BASE_LEAN + rotJitter;
        const driftRatio = -Math.tan(actualLean); // 선의 기울기와 정확히 일치하여 떨어짐

        drops.push({
          originX: bestX,
          rot: rotJitter,
          driftRatio: driftRatio,
          x: bestX + (bestY / SPEED) * (SPEED * driftRatio),
          y: bestY,
          resetY: -BASE_H - (Math.random() * 80),
        });
      }

      // 초당 12.5프레임 갱신 (스톱모션 통일 규격: 80ms)
      const FPS = 12.5, STEP = 1000 / FPS;
      let raf = 0, last = performance.now();
      const tick = (now) => {
        raf = requestAnimationFrame(tick);
        if (now - last < STEP) return;
        const dt = Math.min((now - last) / 16.67, 12);
        last = now;
        ctx.clearRect(0, 0, W, H);
        if (img.complete && img.naturalWidth) {
          const moveY = SPEED * dt;

          for (const d of drops) {
            d.y += moveY;
            d.x += SPEED * d.driftRatio * dt;

            // 바닥을 벗어나면 자신의 고유 궤적(originX) 상단으로 순환 (서로 겹치지 않는 배치 영구 보존)
            if (d.y > H + BASE_H) {
              d.y = d.resetY;
              d.x = d.originX + (d.y / SPEED) * (SPEED * d.driftRatio);
            }

            // [침범 방지 1차] 건물 본체, 간판, 바닥 영역에 닿으면 생략 (간판 아래 영역은 통과하여 비가 내림)
            if (!noMask) {
              const inMain = (d.x >= buildingLeft && d.x <= buildingRight && d.y >= buildingTop && d.y <= buildingBottom);
              const inSign = (d.x >= signLeft && d.x <= signRight && d.y >= signTop && d.y <= signBottom);
              const inBottom = (d.y >= bottomY);
              if (inMain || inSign || inBottom) continue;
            }

            ctx.save();
            ctx.translate(d.x, d.y);
            // 아주 미세하게 개별 차이가 나는 회전 적용
            ctx.rotate(d.rot);
            ctx.drawImage(img, -BASE_W / 2, -BASE_H / 2, BASE_W, BASE_H);
            ctx.restore();
          }

          if (!noMask) {
            // [침범 방지 2차] 건물 본체, 간판, 바닥 영역 마스킹 (간판 아래 영역은 마스킹하지 않아 비가 내림)
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillRect(buildingLeft, buildingTop, buildingRight - buildingLeft, buildingBottom - buildingTop);
            ctx.fillRect(signLeft, signTop, signRight - signLeft, signBottom - signTop);
            ctx.fillRect(0, bottomY, W, H - bottomY);
            ctx.restore();
          }
        }
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    /* ==============================================================
       장면 관리자 & 스케일러 (1366x1024 유지 + 2분 무입력 시 1장면 복귀)
       ============================================================== */
    (() => {
      const stage = document.getElementById('stage');
      const W = 1366, H = 1024;
      const IDLE_MS = 2 * 60 * 1000;

      // 비율 유지 스케일
      const fit = () => {
        stage.style.setProperty('--scale', Math.min(innerWidth / W, innerHeight / H));
      };
      addEventListener('resize', fit);
      fit();

      let current = null;

      // ========== S1 배경음악 (1번~18번 장면 재생, 대기화면 슬라이드업 시 동시 시작) ==========
      const ambientAudio = new Audio('02_motions/s1_ambient.mp3');
      ambientAudio.loop = true;
      ambientAudio.preload = 'auto';

      let pendingPlay = false;
      let fadeTimer = null;

      function playAmbient() {
        if (fadeTimer) {
          clearInterval(fadeTimer);
          fadeTimer = null;
        }
        ambientAudio.volume = 1.0;
        const playPromise = ambientAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              pendingPlay = false;
            })
            .catch(() => {
              // 브라우저 자동재생 제한 시 다음 클릭/터치 시 재생 대기
              pendingPlay = true;
            });
        }
      }

      function stopAmbient(fade = true) {
        pendingPlay = false;
        if (fadeTimer) {
          clearInterval(fadeTimer);
          fadeTimer = null;
        }
        if (ambientAudio.paused) return;

        if (!fade) {
          ambientAudio.pause();
          ambientAudio.currentTime = 0;
          ambientAudio.volume = 1.0;
          return;
        }

        const startVol = ambientAudio.volume;
        const duration = 600;
        const startTime = performance.now();
        fadeTimer = setInterval(() => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          ambientAudio.volume = Math.max(0, startVol * (1 - progress));
          if (progress >= 1) {
            clearInterval(fadeTimer);
            fadeTimer = null;
            ambientAudio.pause();
            ambientAudio.currentTime = 0;
            ambientAudio.volume = 1.0;
          }
        }, 30);
      }

      function updateAmbientAudio(n) {
        // S1의 1번(Scene 2)부터 18번(Scene 19)까지 오디오 재생
        if (n >= 2 && n <= 19) {
          if (ambientAudio.paused || fadeTimer) {
            playAmbient();
          }
        } else {
          stopAmbient(true);
        }
      }

      // 브라우저 오디오 자동재생 정책 대응: 사용자가 화면을 클릭하거나 키를 누를 때 대기 중인 오디오 즉시 시작
      ['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach((ev) => {
        window.addEventListener(ev, () => {
          if (pendingPlay && current && current.n >= 2 && current.n <= 19) {
            playAmbient();
          }
        }, { passive: true });
      });

      function goTo(n, transition = 'none') {
        const def = window.SCENES[n];
        if (!def) { console.warn('장면 없음:', n); return; }

        // 대기화면이 위로 올라감과 동시에 재생 시작 & 1번~18번(n=2~19) 구간 유지/정지
        updateAmbientAudio(n);

        const el = document.createElement('section');
        el.className = `scene scene-${String(n).padStart(2, '0')}`;
        const prev = current;

        if (transition === 'slideUp' && prev) {
          stage.insertBefore(el, prev.el);
          prev.el.classList.add('slide-up-out');
          prev.el.addEventListener('animationend', () => destroy(prev), { once: true });
        } else if (transition === 'fade' && prev) {
          stage.appendChild(el);
          el.classList.add('fade-in');
          el.addEventListener('animationend', () => {
            el.classList.remove('fade-in');
            destroy(prev);
          }, { once: true });
        } else {
          stage.appendChild(el);
          if (prev) destroy(prev);
        }

        current = { n, el, scene: null };
        current.scene = def.mount(el, api) || {};

        // 대화창 맨 아래 줄 또는 대화창 없는 화면의 최상단 레이어에 '현재장면/70' 번호 표기 자동 부착 (대기화면 제외)
        if (n !== 1) { // 대기화면(Scene 1) 제외
          const displayNum = Math.max(1, n - 1);
          const navList = [];
          for (let k = 2; k <= 20; k++) {
            if (window.SCENES[k]) navList.push({ key: k, pageNum: k - 1 });
          }
          const curIdx = Math.max(0, navList.findIndex((item) => item.key === n));
          const maxIdx = Math.max(1, navList.length - 1);
          const ratio = curIdx / maxIdx;
          const fillWidth = (curIdx === maxIdx) ? '100%' : `${Math.max(10, Math.round(10 + (860 - 10) * ratio))}px`;

          const attachCounterAndProgress = (container) => {
            if (!container.querySelector('.scene-counter')) {
              const counterEl = document.createElement('div');
              counterEl.className = 'scene-counter';
              counterEl.textContent = `${displayNum}/70`;
              counterEl.title = '더블클릭하여 페이지 이동 척도바 열기/닫기';
              ['mousedown', 'pointerdown', 'click'].forEach((ev) => {
                counterEl.addEventListener(ev, (e) => e.stopPropagation());
              });
              counterEl.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.__SCENE_PROGRESS_OPEN__ = !window.__SCENE_PROGRESS_OPEN__;
                stage.querySelectorAll('.scene-progress-wrap').forEach((w) => {
                  w.classList.toggle('open', !!window.__SCENE_PROGRESS_OPEN__);
                });
              });
              container.appendChild(counterEl);
            }
            if (!container.querySelector('.scene-progress-wrap')) {
              const wrapEl = document.createElement('div');
              wrapEl.className = 'scene-progress-wrap' +
                (window.__SCENE_PROGRESS_OPEN__ ? ' open' : '') +
                (window.__SCENE_PROGRESS_DRAGGING__ ? ' dragging' : '');
              if (typeof window.__SCENE_PROGRESS_HOVER_RATIO__ === 'number') {
                wrapEl.style.setProperty('--hover-ratio', window.__SCENE_PROGRESS_HOVER_RATIO__);
              }
              wrapEl.innerHTML = `
                <div class="scene-progress-bar">
                  <div class="scene-progress-hover"></div>
                  <div class="scene-progress-fill" style="width: ${fillWidth};"></div>
                </div>
              `;
              const barEl = wrapEl.querySelector('.scene-progress-bar');
              const updateHover = (e) => {
                const rect = barEl.getBoundingClientRect();
                if (rect.width <= 0) return;
                const r = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                window.__SCENE_PROGRESS_HOVER_RATIO__ = r;
                wrapEl.style.setProperty('--hover-ratio', r);
                const hoverIdx = Math.max(0, Math.min(navList.length - 1, Math.round(r * maxIdx)));
                if (navList[hoverIdx]) {
                  wrapEl.title = `${navList[hoverIdx].pageNum}/70 페이지로 이동`;
                }
              };
              wrapEl.addEventListener('pointerenter', updateHover);
              wrapEl.addEventListener('pointermove', updateHover);
              ['click', 'dblclick'].forEach((ev) => {
                wrapEl.addEventListener(ev, (e) => e.stopPropagation());
              });

              const seekSceneByClientX = (clientX) => {
                const activeBar = stage.querySelector('.scene-progress-bar') || barEl;
                const rect = activeBar.getBoundingClientRect();
                if (rect.width <= 0 || navList.length === 0) return;
                const r = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
                window.__SCENE_PROGRESS_HOVER_RATIO__ = r;
                const targetIdx = Math.max(0, Math.min(navList.length - 1, Math.round(r * maxIdx)));
                const target = navList[targetIdx];
                if (target && current && current.n !== target.key) {
                  goTo(target.key, 'none');
                }
              };

              wrapEl.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                window.__SCENE_PROGRESS_DRAGGING__ = true;
                stage.querySelectorAll('.scene-progress-wrap').forEach((w) => w.classList.add('dragging'));
                seekSceneByClientX(e.clientX);
                const onMove = (ev) => {
                  if (!window.__SCENE_PROGRESS_DRAGGING__) return;
                  ev.preventDefault();
                  seekSceneByClientX(ev.clientX);
                };
                const onUp = () => {
                  window.__SCENE_PROGRESS_DRAGGING__ = false;
                  stage.querySelectorAll('.scene-progress-wrap').forEach((w) => w.classList.remove('dragging'));
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                  window.removeEventListener('blur', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
                window.addEventListener('blur', onUp);
              });

              wrapEl.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                e.stopPropagation();
                window.__SCENE_PROGRESS_DRAGGING__ = true;
                stage.querySelectorAll('.scene-progress-wrap').forEach((w) => w.classList.add('dragging'));
                seekSceneByClientX(e.touches[0].clientX);
                const onTouchMove = (ev) => {
                  if (!window.__SCENE_PROGRESS_DRAGGING__ || ev.touches.length !== 1) return;
                  ev.preventDefault();
                  seekSceneByClientX(ev.touches[0].clientX);
                };
                const onTouchEnd = () => {
                  window.__SCENE_PROGRESS_DRAGGING__ = false;
                  stage.querySelectorAll('.scene-progress-wrap').forEach((w) => w.classList.remove('dragging'));
                  window.removeEventListener('touchmove', onTouchMove);
                  window.removeEventListener('touchend', onTouchEnd);
                  window.removeEventListener('touchcancel', onTouchEnd);
                };
                window.addEventListener('touchmove', onTouchMove, { passive: false });
                window.addEventListener('touchend', onTouchEnd);
                window.addEventListener('touchcancel', onTouchEnd);
              }, { passive: true });

              container.appendChild(wrapEl);
            }
          };

          const dialogWraps = el.querySelectorAll('.dialog-wrap');
          if (dialogWraps.length > 0) {
            dialogWraps.forEach((dw) => attachCounterAndProgress(dw));
          } else {
            attachCounterAndProgress(el);
          }
        }

        // 모든 장면에 공통 컬러 필터 레이어 (#FFDB3B, 25%, multiply) 적용 (대기화면 포함)
        const hasDialog = !!el.querySelector('.dialog-wrap');
        const filter = document.createElement('div');
        filter.className = `scene-color-filter ${hasDialog ? 'with-dialog' : 'full'}`;
        el.appendChild(filter);

        resetIdle();
      }

      function destroy(s) {
        if (s.scene && s.scene.unmount) s.scene.unmount();
        s.el.remove();
      }

      const api = {
        goTo,
        next: (transition) => goTo(current.n + 1, transition),
        prev: (transition) => goTo(Math.max(1, current.n - 1), transition),
        get current() { return current && current.n; },
      };
      window.App = api;

      // 마우스 우클릭 시 이전 장면으로 이동
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (current && current.n > 1) {
          api.prev('fade');
        }
      });

      // 2분 무입력 타이머
      let idleTimer = null;
      function resetIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (current && current.n !== 1) goTo(1, 'fade');
        }, IDLE_MS);
      }
      ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'].forEach((ev) =>
        addEventListener(ev, resetIdle, { passive: true })
      );

      goTo(1);
    })();