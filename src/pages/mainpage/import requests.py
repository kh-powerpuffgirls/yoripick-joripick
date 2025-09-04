import requests
from bs4 import BeautifulSoup
import time

output_file = "fatsecret_spices.txt"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/119.0.0.0 Safari/537.36",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
}

with open(output_file, "w", encoding="utf-8") as f:
    # for page in range(0, 133):  # 0 ~ 133 페이지
    #     url = f"https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/search?q=%EC%86%8C%EC%8A%A4&pg={page}"
        
        
    #     print(f"페이지 {page} 수집 중...")
    #     res = requests.get(url, headers=headers)

    #     res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    #     if res.status_code != 200:
    #         print(f"페이지 {page} 접근 실패 (status {res.status_code})")
    #         continue
        
    #     if res.status_code == 429:
    #         print("429 발생, 30초 대기 후 재시도")
    #         time.sleep(30)
    #         res = requests.get(url, headers=headers)

    #     time.sleep(2)  # 페이지 사이 간격 (2초 권장)

    #     soup = BeautifulSoup(res.text, "html.parser")

    #     items = soup.select("td.borderBottom")  # 검색 결과 아이템
    #     if not items:
    #         print(f"페이지 {page} 데이터 없음")
    #         continue

    #     for item in items:
    #         title = item.select_one("a.prominent").get_text(strip=True) if item.select_one("a.prominent") else ""
    #         details = item.select_one("div.smallText.greyText.greyLink").get_text(" ", strip=True) if item.select_one("div.smallText.greyText.greyLink") else ""

    #         line = f"{title}\n{details}\n"
    #         f.write(line + "\n")
    
    sites={'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EA%B0%95%ED%99%A9?portionid=56635&portionamount=100.000', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%B2%AD%ED%95%98/%EC%B2%AD%ED%95%98/1%EC%9E%94', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%B2%AD%EC%A0%95%EC%9B%90/%EB%A7%9B%EC%88%A0/100ml', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EB%A7%9B%EC%88%A0/%EB%AF%B8%EB%A6%BC/1%ED%9A%8C', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%ED%9B%84%EC%B6%94?portionid=56623&portionamount=100.000', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%ED%8C%8C%EC%8A%AC%EB%A6%AC', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EC%BB%A4%EB%AF%BC', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EC%9C%A1%EB%91%90%EA%B5%AC', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EC%B9%98%EC%BB%A4%EB%A6%AC', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EC%98%A4%EB%A0%88%EA%B0%80%EB%85%B8', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EC%83%9D%EA%B0%95', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EB%B0%94%EB%8B%90%EB%9D%BC-%EC%B6%94%EC%B6%9C%EB%AC%BC', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EA%B9%A8', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EA%B3%84%ED%94%BC?portionid=56603&portionamount=100.000', 'https://www.fatsecret.kr/%EC%B9%BC%EB%A1%9C%EB%A6%AC-%EC%98%81%EC%96%91%EC%86%8C/%EC%9D%BC%EB%B0%98%EB%AA%85/%EA%B2%A8%EC%9E%90?portionid=55702&portionamount=100.000'}
    
    for site in sites:  # 상세 페이지
        url = f"{site}"
        
        
        print(f"페이지 수집 중...")
        res = requests.get(url, headers=headers)

        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        if res.status_code != 200:
            print(f"페이지 접근 실패 (status {res.status_code})")
            continue
        
        if res.status_code == 429:
            print("429 발생, 30초 대기 후 재시도")
            time.sleep(30)
            res = requests.get(url, headers=headers)

        time.sleep(1)  # 페이지 사이 간격 (2초 권장)

        soup = BeautifulSoup(res.text, "html.parser")

        data_list = []
        items = soup.select("div.nutrition_facts.international")  # 검색 결과 아이템
        if not items:
            print(f"페이지 데이터 없음")
            continue

        # for item in items:
        #     title = item.select_one("a.prominent").get_text(strip=True) if item.select_one("a.prominent") else ""
        #     details = item.select_one("div.smallText.greyText.greyLink").get_text(" ", strip=True) if item.select_one("div.smallText.greyText.greyLink") else ""

        #     line = f"{title}\n{details}\n"
        #     f.write(line + "\n")
            
            
        for item in items:
            sub_divs = item.find_all("div")
            row = [div.get_text(" ", strip=True) for div in sub_divs if div.get_text(strip=True)]
            data_list.append(row)

        print(data_list)

print("✅ 수집 완료! fatsecret_sauce.txt 파일이 생성되었습니다.")