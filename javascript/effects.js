//h2和p的文字效果
document.addEventListener("DOMContentLoaded", function() {
    const h2TextElements = document.querySelectorAll('h2');
	const pTextElements = document.querySelectorAll('p');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 一旦顯示，停止觀察該元素
            }
        });
    });

    h2TextElements.forEach(element => {
        observer.observe(element);
    });
	pTextElements.forEach(element => {
        observer.observe(element);
    });
});

document.addEventListener("DOMContentLoaded", function () {
	const btn = document.getElementById("expand-btn");
	const hiddenParas = document.querySelectorAll("#introduce .extra");

	btn.addEventListener("click", function () {
		hiddenParas.forEach(p => {
			p.classList.remove("hidden");
			p.style.display = "block"; // 確保解除 hidden 後有顯示
		});
		btn.style.display = "none";
	});
});


//logo的淡出效果
window.onload = function() {
	setTimeout(function() {
		FadeOutBlock();
		document.getElementById('logo').classList.add('fade-out');
		document.body.style.position = 'relative';
		setTimeout(function() {
			document.getElementById('logo').style.display = 'none'; // 隱藏遮罩層
		}, 1000);
	}, 2000); // 3000 毫秒（3秒）
}

function FadeOutBlock() {
	const h2TextElement = document.getElementsByTagName('h2');
	const pTextElement = document.getElementsByTagName('p');
	
	document.getElementsByClassName('video-container')[0].style.display = 'block';
	for (let i = 0; i < h2TextElement.length; i++) {
		h2TextElement[i].style.display = 'block';
	}
	for (let i = 0; i < pTextElement.length; i++) {
		if (!pTextElement[i].classList.contains('extra')) {
			pTextElement[i].style.display = 'block';
		}
	}
}
