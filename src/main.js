// DOM에서 form 선택
const $form = document.querySelector("form");

// input 입력값들을 ID로 DOM에서 획득.
let input1 = document.getElementById("input1");
let input2 = document.getElementById("input2");
let input3 = document.getElementById("input3");

// DOM에서 chat 내역 선택.
const $chatList = document.querySelector("ul");

// openAI API
// 주의 : 보안상 위험 (client side Vanilla JS.)
let url = `https://estsoft-openai-api.jejucodingcamp.workers.dev/`;

// 사용자의 질문
let question;

// 질문과 답변 저장
let data = [
  {
    role: "system",
    content:
      "assistant는 도서관의 사서입니다. 어투는 온화한 문학소녀 입니다. 라이트노벨에 한정되지 않고, 모든 서브컬쳐류 작품, 미디어를 알려줄 수 있지만, 실사 드라마 영화는 제외합니다. 주어지는 질문은 크게 (선호하는 장르, 라이트노벨, 분위기) 3가지이며 다음과 같습니다. 첫째는 좋아하는 장르에 대한 질문. 만약 '추천' 또는 '없음' 및 '장르'에 해당되는 단어가 없을 경우에는, 질문자가 어떻게 질문해야 할지 안내합니다. 그로 인해, 질문자의 성향에 대한 정보를 추가로 수집하여, 분석합니다. 둘째는 최근에 읽은 라이트 노벨 또는 만화 제목. 만약 '없다' 또는 '추천' 단어가 있을 경우엔, 입력된 문장의 어휘 뉘앙스에 맞춰 부합하는 라이트노벨로 추천합니다. 셋째. 이야기의 분위기는 어떤 편이 좋은지?. 이 질문은 질문자의 성격 분석. 취향에 맞는 라이트노벨 추천이 목적입니다. 질문자에게서 얻어낸 정보를 취합하여, 각 작품별로 간단한 '줄거리 소개', '추천하는 이유'를 요약합니다. 단, 제목은 반드시 실존하는 것이어야 하며, 없으면 없다 하면 됩니다. 정확도를 높이기 위해, 제목은 가능하다면 한국어 이외에도 영어, 일본어도 표기하세요.",
  },
];

data.push(
  {
    role: "user",
    content: "다음의 조건에 맞는 비슷한 라이트노벨을 추천해 줘.",
  },
  {
    role: "assistant",
    content: "당신이 말해준 조건에 맞는 라이트 노벨은 다음과 같습니다.",
  }
);

// 화면에 뿌려줄 데이터, 질문들
let questionData = [];

// input에 입력된 질문 받아오는 함수 -> 질문글 표시.
let inputs = document.querySelectorAll("#input1, #input2, #input3");

inputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    question = `${input1.value} ${input2.value} ${input3.value}`;
  });
});

const sendQuestion = (question) => {
  if (question) {
    data.push({
      role: "user",
      content: question,
    });
    questionData.push({
      role: "user",
      content: question,
    });
  }
};

// 화면에 질문 그려주는 함수
const printQuestion = async () => {
  if (question) {
    let li = document.createElement("li");
    li.classList.add("question");

    let span = document.createElement("span");
    span.innerText = "다음의 문장을 기반으로 알아보고 있어요: ";
    li.appendChild(span);

    questionData.map((el) => {
      let questionText = document.createElement("span");
      questionText.innerText = el.content;
      li.appendChild(questionText);
    });

    $chatList.appendChild(li);
    questionData = [];
    question = false;
  }
};

// 화면에 답변 그려주는 함수
const printAnswer = async (answer) => {
  // 답변 표시
  let li = document.createElement("li");
  // transition effect to highlight the answer.
  li.classList.add("answer", "fade");
  li.innerText = answer;
  $chatList.appendChild(li);

  setTimeout(() => {
    li.classList.add("fadeIn");
  }, 500);

  // 클립보트로 복사 버튼
  let copyButton = document.createElement("button");
  // style 을 위한 클래스 부여
  copyButton.classList.add("copyButton");
  copyButton.innerText = "이 답변 내용을 복사합니다.";
  copyButton.type = "button";
  copyButton.addEventListener("click", (e) => {
    e.stopPropagation();

    // 클립보드에 해당 답변을 복사
    navigator.clipboard
      .writeText(answer)
      .then(() => {
        console.log(
          "printAnswer -> copyButton, navigator : 클립보드 복사 성공"
        );
      })
      .catch((err) => {
        console.log("뭔가 잘못되었습니다. printAnswer -> copyButton", err);
      });
  });
  $chatList.appendChild(copyButton);

  // URL 링크 추가
  let link = document.createElement("a");
  link.href = "https://www.aladin.co.kr";
  link.textContent = "알라딘 온라인 서점";
  link.target = "_blank";
  link.id = "copyButton2";
  $chatList.appendChild(link);

  // 새로고침 버튼
  let resetButton = document.createElement("button");
  resetButton.setAttribute("type", "button");
  resetButton.classList.add("resetButton");
  resetButton.innerText = "Reset";
  resetButton.addEventListener("click", () => {
    $form.reset();
    location.reload();
  });
  $chatList.appendChild(resetButton);
};

// openAI 측 api로 요청보내는 함수
const apiPost = async () => {
  const result = await axios({
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
  });
  try {
    console.log("apiPost에서 result.data :", result.data);
    // an order of openAI's priority answer option, lower number means top rated.
    printAnswer(result.data.choices[0].message.content);
  } catch (err) {
    console.log("apiPost 에서 문제 발생. 확인해주세요.", err);
  }
};

// transition - loading
const showLoadingSvg = () => {
  document.getElementById("loadingSvg").style.display = "block";
};

const hideLoadingSvg = () => {
  document.getElementById("loadingSvg").style.display = "none";
};

// submit - this one works as a submit (전송) button to interact with JS.
$form.addEventListener("submit", (e) => {
  e.preventDefault();

  // 사용자 input 에 '.' 2개 이상 입력 시, 제거.
  input1.value = input1.value.replace(/\./g, "");
  input2.value = input2.value.replace(/\./g, "");
  input3.value = input3.value.replace(/\./g, "");

  // 모든 입력값을 한 곳으로 합치는 곳. 답변 영역.
  let combinedQuestion = `${input1.value}. ${input2.value}. ${input3.value}.`;

  // submit 후, 입력 값 초기화.
  input1.value = null;
  input2.value = null;
  input3.value = null;

  sendQuestion(combinedQuestion);
  showLoadingSvg();
  apiPost().finally(hideLoadingSvg);
  printQuestion();
});
