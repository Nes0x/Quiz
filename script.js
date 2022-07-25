window.onload = () => {
    const quiz = new Quiz();
    quiz.start();
}

class Quiz {
    currentQuestionIndex = -1;

    async start () {
        this.progress = document.querySelector("#progress");
        this.countdown = document.querySelector("#countdown");
        this.questionHeading = document.querySelector("#question-heading");
        this.answers = document.querySelector("#answers-list");
        this.summary = document.querySelector(".summary");
        this.submit = document.querySelector("#submit")
        this.submit.addEventListener("click", this.submitAnswer);
        this.restart = document.querySelector("#restart")
        this.restart.addEventListener("click", this.restartQuiz);


        await this.loadData();
        this.restartQuiz()
    }


    loadData = async () => {
        let questionsFile = await fetch("questions.json");
        let json = await questionsFile.json();

        if (!json.questions || !json.time) {
            console.log("Brakuje pytań lub czasu!");
            return;
        }

        this.questions = json.questions;
        this.time = json.time * 1000;
    }

    submitAnswer = () => {
        const userSelect = document.querySelector("input[type='radio']:checked")

        const userSelectIndex = userSelect.getAttribute("data-index");
        const question = this.questions[this.currentQuestionIndex];
        question.userSelectedIndex = userSelectIndex;
        if (userSelect) this.setNextQuestion();

    }

    restartQuiz = () => {
        this.questions.forEach(question => question.userSelectedIndex = -1);
        this.currentQuestionIndex = -1;
        this.countdownQuiz();
        this.setNextQuestion();

        this.answers.classList.remove("hide");
        this.submit.classList.remove("hide");
        this.restart.classList.remove("show");
        this.summary.classList.add("hide");

    }

    countdownQuiz = () => {
        if (!this.countdownInterval) {
            this.quizStartTime = new Date().getTime();
            this.quizEndTime = this.quizStartTime + this.time;

            this.countdownInterval = setInterval(() => {
                const currentTime = new Date().getTime();

                if (currentTime >= this.quizEndTime) {
                    console.log("Koniec!");
                    this.stopCountdown();
                    this.showSummary();
                    return;
                }

                let timeLeft = Math.floor((this.quizEndTime - currentTime) / 1000);
                this.countdown.textContent = "Pozostało: " + timeLeft + " sekund/y";

            }, 1000);
        }
    }

    stopCountdown = () => {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.countdown.textContent = "";
    }

    setNextQuestion = () => {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex >= this.questions.length) {
            console.log("Koniec!");
            this.showSummary();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        this.questionHeading.textContent = question.question;
        this.progress.textContent = `Pytanie ${this.currentQuestionIndex + 1} z ${this.questions.length}`;

        const answersHtml = question.answers.map((answer, index) => {
            const id = "answer" + index;
            return `
                <li>
                    <label for="${id}">${answer}</label>
                    <input type="radio" data-index="${index}" name="answer" id="${id}" class="answer">
                </li>
            `
        }).join("");
        this.answers.innerHTML = answersHtml;

    }

    showSummary = () => {
        this.stopCountdown();
        this.answers.classList.add("hide");
        this.submit.classList.add("hide");
        this.restart.classList.add("show");
        this.summary.classList.remove("hide");

        this.progress.textContent = "Koniec!";

        this.questionHeading.textContent = "Podsumowanie quizu!";


        let correctAnswers = 0;

        let summaryHtml = this.questions.map((question, questionIndex) => {
            const id = "answer" + questionIndex;


            const answersHtml = question.answers.map((answer, answerIndex) => {
                let classToAdd = "";

                if (question.userSelectedIndex !== undefined) {
                    if (question.userSelectedIndex == question.correct && answerIndex == question.correct) {
                        correctAnswers++;
                        classToAdd = "correct-answer";
                    }
                }

                if (question.userSelectedIndex != question.correct && answerIndex == question.correct) {
                    classToAdd = "wrong-answer";
                }

                return `
                    <li class="${classToAdd}">
                        <label for="${id}">${answer}</label>
                        <input disabled type="radio" name="answer" id="${id}" data-index="${answerIndex}" class="answer">
                    </li>
                
                `
            }).join("");

            return `
               <h4>
                    Pytanie nr. ${questionIndex + 1} : ${question.question}
                    <ul>${answersHtml}</ul>
               </h4>
            `;
        }).join("");

        this.summary.scrollTop = 0;

        summaryHtml += `
            <hr>
            <h3>Ilość prawidłowych odpowiedzi: ${correctAnswers}, na ${this.questions.length}</h3>  
        `;
        this.summary.innerHTML = summaryHtml;


    }




}