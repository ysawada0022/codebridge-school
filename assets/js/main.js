/**
 * CODEBRIDGE - Online IT Career School
 * main.js
 * -------------------------------------------------------
 * 1. 初期化 / no-js クラスの除去
 * 2. スクロール進捗バー・ヘッダー・追従CTA
 * 3. スマホ用ナビゲーション
 * 4. 実績数値のカウントアップ
 * 5. 適性診断クイズ（多段階・分岐なし単純集計）
 * 6. 給付金シミュレーター
 * 7. お客様の声スライダー（Swiper）
 * 8. スクロールアニメーション（AOS）
 * 9. 無料カウンセリングフォームのバリデーション
 */
(function () {
  'use strict';

  // 二重読み込み時に処理が重複しないようにする
  if (window.codebridgeInitialized) return;
  window.codebridgeInitialized = true;

  document.body.classList.remove('no-js');

  /* ------------------------------------------------------
     2. progress bar / header / floating cta
     ------------------------------------------------------ */
  var progress = document.getElementById('js-progress');
  var header = document.getElementById('js-header');
  var floatingCta = document.getElementById('js-floating-cta');
  var ticking = false;

  function onScroll() {
    var scrollTop = window.scrollY;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      var rate = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
      progress.style.width = rate + '%';
    }
    if (header) {
      header.classList.toggle('header--scrolled', scrollTop > 10);
    }
    if (floatingCta) {
      floatingCta.classList.toggle('floating-cta--show', scrollTop > window.innerHeight * 0.8);
    }
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  var pagetop = document.getElementById('js-pagetop');
  if (pagetop) {
    pagetop.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------
     3. sp navigation
     ------------------------------------------------------ */
  var navToggle = document.getElementById('js-nav-toggle');
  var nav = document.getElementById('js-nav');

  function closeNav() {
    if (!navToggle || !nav) return;
    navToggle.classList.remove('header__toggle--open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('header__nav--open');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('header__nav--open');
      navToggle.classList.toggle('header__toggle--open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ------------------------------------------------------
     4. count up
     ------------------------------------------------------ */
  var counters = document.querySelectorAll('.js-count');

  function countUp(element) {
    var goal = parseFloat(element.dataset.count);
    var decimals = parseInt(element.dataset.decimals || '0', 10);
    var duration = 1400;
    var startedAt = null;

    function step(timestamp) {
      if (startedAt === null) startedAt = timestamp;
      var progressRate = Math.min((timestamp - startedAt) / duration, 1);
      var eased = 1 - Math.pow(1 - progressRate, 3);
      var current = goal * eased;

      element.textContent =
        decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString('ja-JP');

      if (progressRate < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = decimals > 0 ? goal.toFixed(decimals) : goal.toLocaleString('ja-JP');
      }
    }

    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );

      counters.forEach(function (counter) {
        counterObserver.observe(counter);
      });
    } else {
      counters.forEach(function (counter) {
        var decimals = parseInt(counter.dataset.decimals || '0', 10);
        var goal = parseFloat(counter.dataset.count);
        counter.textContent = decimals > 0 ? goal.toFixed(decimals) : goal.toLocaleString('ja-JP');
      });
    }
  }

  /* ------------------------------------------------------
     5. 適性診断クイズ
     ------------------------------------------------------ */
  var quiz = document.getElementById('js-quiz');

  if (quiz) {
    var steps = Array.prototype.slice.call(quiz.querySelectorAll('.quiz__step'));
    var progressBars = Array.prototype.slice.call(quiz.querySelectorAll('.quiz__progress-bar'));
    var totalQuestions = steps.length - 1; // 最後の1枚は結果表示
    var scores = { web: 0, data: 0, design: 0 };

    var COURSES = {
      web: {
        label: 'あなたにおすすめのコースは',
        title: 'Web開発コース',
        text: '手を動かしながら形にするのが好きなタイプです。要件通りに作り切る集中力を活かして、まずはWebアプリケーション開発から始めるのが近道です。',
        href: '#course-web'
      },
      data: {
        label: 'あなたにおすすめのコースは',
        title: 'データサイエンスコース',
        text: '数字や理由を掘り下げて考えるのが得意なタイプです。分析結果をもとに意思決定を支える仕事は、その粘り強さがそのまま強みになります。',
        href: '#course-data'
      },
      design: {
        label: 'あなたにおすすめのコースは',
        title: 'UI/UXデザインコース',
        text: '使う人の気持ちを想像しながら考えるのが得意なタイプです。使いやすさや見た目の印象を突き詰める仕事に向いています。',
        href: '#course-design'
      }
    };

    function showStep(index) {
      steps.forEach(function (step, i) {
        step.classList.toggle('quiz__step--active', i === index);
      });
      progressBars.forEach(function (bar, i) {
        bar.classList.toggle('quiz__progress-bar--done', i < index);
        var fill = bar.querySelector('.quiz__progress-fill');
        if (fill && i === index) fill.style.width = '35%';
        if (fill && i > index) fill.style.width = '0%';
      });
    }

    function computeResult() {
      var top = 'web';
      var max = -1;
      Object.keys(scores).forEach(function (key) {
        if (scores[key] > max) {
          max = scores[key];
          top = key;
        }
      });
      return COURSES[top];
    }

    quiz.querySelectorAll('.quiz__option').forEach(function (button) {
      button.addEventListener('click', function () {
        var type = button.dataset.type;
        if (type && scores.hasOwnProperty(type)) scores[type] += 1;

        var currentStep = button.closest('.quiz__step');
        var currentIndex = steps.indexOf(currentStep);

        if (currentIndex === totalQuestions - 1) {
          var result = computeResult();
          quiz.querySelector('.js-quiz-result-course').textContent = result.title;
          quiz.querySelector('.js-quiz-result-text').textContent = result.text;
          quiz.querySelector('.js-quiz-result-link').setAttribute('href', result.href);
        }

        showStep(Math.min(currentIndex + 1, steps.length - 1));
      });
    });

    quiz.querySelectorAll('.quiz__back').forEach(function (button) {
      button.addEventListener('click', function () {
        var currentStep = button.closest('.quiz__step');
        var currentIndex = steps.indexOf(currentStep);
        showStep(Math.max(currentIndex - 1, 0));
      });
    });

    var retryBtn = quiz.querySelector('.js-quiz-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        scores = { web: 0, data: 0, design: 0 };
        showStep(0);
      });
    }

    showStep(0);
  }

  /* ------------------------------------------------------
     6. 給付金シミュレーター
     ------------------------------------------------------ */
  var simulator = document.getElementById('js-subsidy-sim');

  if (simulator) {
    var courseSelect = document.getElementById('sim-course');
    var eligibleCheck = document.getElementById('sim-eligible');
    var outFull = document.getElementById('js-sim-full');
    var outSubsidy = document.getElementById('js-sim-subsidy');
    var outNet = document.getElementById('js-sim-net');
    var outComment = document.getElementById('js-sim-comment');

    var COURSES_SIM = {
      web: { price: 495000, subsidyEligible: true },
      data: { price: 528000, subsidyEligible: true },
      design: { price: 462000, subsidyEligible: false }
    };

    function yen(n) {
      return Math.round(n).toLocaleString('ja-JP');
    }

    function update() {
      var course = COURSES_SIM[courseSelect.value] || COURSES_SIM.web;
      var price = course.price;
      // UI/UXデザインコースは制度上そもそも給付金の対象外（コース側の条件が優先）
      var eligible = course.subsidyEligible && eligibleCheck.checked;
      // 専門実践教育訓練給付金を想定：受講料の最大70%（上限あり）を給付
      var subsidyRate = eligible ? 0.7 : 0;
      var subsidy = Math.min(price * subsidyRate, 560000);
      var net = price - subsidy;

      eligibleCheck.disabled = !course.subsidyEligible;

      outFull.textContent = yen(price);
      outSubsidy.textContent = (subsidy > 0 ? '-' : '') + yen(subsidy);
      outNet.textContent = yen(net);

      if (!course.subsidyEligible) {
        outComment.textContent =
          'UI/UXデザインコースは、教育訓練給付金制度の対象講座に含まれていません。全額が自己負担となりますが、分割払い（最大24回）はご利用いただけます。';
      } else if (!eligibleCheck.checked) {
        outComment.textContent =
          '給付金の対象条件（雇用保険の被保険者期間など）に当てはまるかは、ハローワークでの事前確認をおすすめします。対象であれば実質負担額を大きく抑えられます。';
      } else if (net <= 0) {
        outComment.textContent = '給付上限に達する組み合わせです。実際の給付額は受講開始前にハローワークで確定します。';
      } else {
        outComment.textContent =
          '在職中・離職後いずれの申請にも対応しています。給付の入金は修了後となるため、受講料は一旦全額のお支払いが必要です。';
      }
    }

    simulator.addEventListener('change', update);
    update();
  }

  /* ------------------------------------------------------
     7. voice slider
     ------------------------------------------------------ */
  if (typeof Swiper !== 'undefined' && document.getElementById('js-voice-slider')) {
    new Swiper('#js-voice-slider', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 20,
      speed: 600,
      autoplay: { delay: 5200, disableOnInteraction: false },
      pagination: { el: '.voice-slider .swiper-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1100: { slidesPerView: 3, spaceBetween: 28 }
      }
    });
  }

  /* ------------------------------------------------------
     8. AOS
     ------------------------------------------------------ */
  if (typeof AOS === 'undefined') {
    document.querySelectorAll('[data-aos]').forEach(function (el) {
      el.removeAttribute('data-aos');
    });
  } else {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: function () {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    });
  }

  /* ------------------------------------------------------
     9. reservation form
     ------------------------------------------------------ */
  var form = document.getElementById('js-form');

  if (form) {
    var result = document.getElementById('js-form-result');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        var invalid = form.querySelector(':invalid');
        if (invalid) invalid.focus();
        return;
      }

      // デモサイトのため送信は行わず、完了メッセージのみ表示する
      form.reset();
      form.classList.remove('was-validated');

      if (result) {
        result.hidden = false;
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();
