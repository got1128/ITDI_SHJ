document.addEventListener("DOMContentLoaded", function () {
    const puzzleContainer = document.getElementById('puzzle-container');
    const checkButton = document.getElementById('check-button');
    const quotesContainer = document.getElementById('quotes-container');

    const positions = [
        { left: 0, top: 0 }, { left: 200, top: 0 }, { left: 400, top: 0 },
        { left: 0, top: 200 }, { left: 200, top: 200 }, { left: 400, top: 200 },
        { left: 0, top: 400 }, { left: 200, top: 400 }, { left: 400, top: 400 },
        { left: 0, top: 600 }, { left: 200, top: 600 }, { left: 400, top: 600 }
    ];

    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

    const pieces = positions.map((pos, index) => {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.style.backgroundImage = 'url("professor.png")';
        piece.style.backgroundPosition = `${-pos.left}px ${-pos.top}px`;
        piece.style.left = `${shuffledPositions[index].left}px`;
        piece.style.top = `${shuffledPositions[index].top}px`;
        piece.dataset.index = index;
        piece.dataset.correctLeft = pos.left;
        piece.dataset.correctTop = pos.top;
        piece.draggable = true;
        return piece;
    });

    pieces.forEach(piece => puzzleContainer.appendChild(piece));

    let draggedPiece = null;

    pieces.forEach(piece => {
        piece.addEventListener('dragstart', function () {
            draggedPiece = piece;
        });

        piece.addEventListener('dragover', function (event) {
            event.preventDefault();
        });

        piece.addEventListener('drop', function () {
            if (draggedPiece) {
                const draggedIndex = pieces.indexOf(draggedPiece);
                const droppedIndex = pieces.indexOf(piece);

                puzzleContainer.insertBefore(draggedPiece, piece);
                puzzleContainer.insertBefore(piece, puzzleContainer.children[draggedIndex]);

                pieces[draggedIndex] = piece;
                pieces[droppedIndex] = draggedPiece;

                [draggedPiece.style.left, piece.style.left] = [piece.style.left, draggedPiece.style.left];
                [draggedPiece.style.top, piece.style.top] = [piece.style.top, draggedPiece.style.top];

                draggedPiece = null;
            }
        });
    });

    checkButton.addEventListener('click', function () {
        if (isPuzzleSolved()) {
            fetchQuotesFromGPT();
        } else {
            alert('拼圖還沒有完成哦，繼續加油！');
        }
    });

    function isPuzzleSolved() {
        return pieces.every(piece => {
            const correctLeft = piece.dataset.correctLeft + 'px';
            const correctTop = piece.dataset.correctTop + 'px';
            return piece.style.left === correctLeft && piece.style.top === correctTop;
        });
    }

    async function fetchQuotesFromGPT() {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'Generate five quotes based on the following data: "成大合作德國大學 設立亞洲辦公室 台德課程機會 國際企業實習 博世產學合作 機械工程合作 化學工程合作 智慧養殖技術研發 無毒安全草蝦 抗白點病毒草蝦 良種篩選技術 科學化養殖模組 法國水產合作 有機草蝦養殖 馬達加斯加草蝦 CTCI中鼎合作 智慧工程合作 綠色資源技術 資料分析技術 智慧應用領域 國際競爭力提升 人工智慧人才 室內空氣污染研究 空氣品質管理法 氣候變遷改善". Each quote should be less than ten characters and Please answer in plain text.'
                        }
                    ],
                    max_tokens: 50,
                    n: 5,
                    stop: ['\n']
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            if (!data.choices || !Array.isArray(data.choices)) {
                throw new Error('Unexpected API response format');
            }

            const quotes = data.choices.map(choice => choice.message.content.trim());
            console.log('Generated quotes:', quotes);

            // 清空先前的引用容器內容
            quotesContainer.innerHTML = '';

            // 隨機排列引用
            const shuffledQuotes = quotes.sort(() => Math.random() - 0.5);

            // 获取拼图容器的大小
            const containerRect = puzzleContainer.getBoundingClientRect();

            // 将引用添加到引用容器中，并随机定位
            shuffledQuotes.forEach((quote, index) => {
                const quoteElement = document.createElement('div');
                quoteElement.classList.add('quote');
                quoteElement.textContent = quote;

                // 生成随机位置
                const left = Math.random() * (containerRect.width * 0.9) - 60;
                const top = Math.random() * (containerRect.height * 0.8) + 160; // 留出一些空间

                quoteElement.style.left = `${left}px`;
                quoteElement.style.top = `${top}px`;

                quotesContainer.appendChild(quoteElement);
            });
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    }
});
