import requests
import pandas as pd
from bs4 import BeautifulSoup

# 원재료명-코드만 추출, 농식품 식단관리 음식정보 제공
def call_api(idx):
    base_url = "http://apis.data.go.kr/1390803/nics/AgriFood/MzenFoodCode/getKoreanFoodList?serviceKey="
    api_key = "01653a880ed500a6f9efa149676b3fc9a068a0c9ef2cc58a16c02b784b270b71"
    
    url1 = "&page_No="
    url2 = "&Page_Size=10"
    url = (
        f"{base_url}{api_key}{url1}{idx}{url2}"
    )
    response = requests.get(url)
    xml_data = response.text
    soup = BeautifulSoup(xml_data, 'xml')
    
    print(url)
    return soup

# 전체 데이터 개수 추출
def extract_total_count(soup):
    total_count = int(soup.find("total_Count").text)
    return total_count

def create_dataframe(soup):
    data_list = []
    for item in soup.find_all("item"):
        data = {
            "food_Code": item.find("food_Code").text,
            "large_Name": item.find("large_Name").text,
            "middle_Name": item.find("middle_Name").text,
            "food_Name": item.find("food_Name").text,
            "food_Volume": item.find("food_Volume").text
            # "food_Nm": item.find("food_Nm").text,
            # "food_Code": item.find("food_Code").text,
            # "food_Nm": item.find("food_Nm").text,
            # "nation_Std_Food_Grupp_Code_Nm": item.find("nation_Std_Food_Grupp_Code_Nm").text,
            # "food_Wgh": item.find("food_Wgh").text,
            # "allrgy_Info": item.find("allrgy_Info").text,
            # "food_Image_Address": item.find("food_Image_Address").text,
 
        }
        data_list.append(data)
    df = pd.DataFrame(data_list)
    return df


idx = 325 # 종료지점

#api 탐색 함수 호출
soup = call_api(idx)

# 전체 데이터 개수
total_count = extract_total_count(soup)
print(f"Total Count: {total_count}")

# 데이터프레임 생성
df = create_dataframe(soup)
df.head()


# 전체 데이터를 데이터프레임으로 변환
all_data_frames = []
for idxs in range(1, idx, 1):
    df = create_dataframe(call_api(idxs))
    all_data_frames.append(df)

df = pd.concat(all_data_frames, ignore_index=True)
df.to_csv("ingData.csv", index=False, encoding="utf-8-sig")
df.head()