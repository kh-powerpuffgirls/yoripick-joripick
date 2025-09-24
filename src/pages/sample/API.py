import requests
import pandas as pd
from bs4 import BeautifulSoup
# 가축질병발생정보 호출
def call_api(idx):
    base_url = "http://openapi.foodsafetykorea.go.kr/api/db13966eb6334c49aa51/COOKRCP01/xml"
    # api_key = "db13966eb6334c49aa51"
    
    stidX = idx
    edidx = idx + 99
    
    url = (
        f"{base_url}/{stidX}/{edidx}"
    )
    response = requests.get(url)
    xml_data = response.text
    soup = BeautifulSoup(xml_data, 'xml')
    print(url)
    return soup

# 전체 데이터 개수 추출
def extract_total_count(soup):
    total_count = int(soup.find("total_count").text)
    return total_count
def create_dataframe(soup):
    data_list = []
    for item in soup.find_all("row"):
        data = {
            #RECIPE
            "RCP_SEQ": item.find("RCP_SEQ").text,                   #RCP_NO
            "RCP_WAY2": item.find("RCP_WAY2").text,                 #RCP_MTH_NO 조리방법
            "RCP_PAT2": item.find("RCP_PAT2").text,                 #RCP_STA_NO 요리종류
            "RCP_NM": item.find("RCP_NM").text,                     #RCP_NAME
            "HASH_TAG": item.find("HASH_TAG").text,                 # ?TAG
            "ATT_FILE_NO_MAIN": item.find("ATT_FILE_NO_MAIN").text, #IMAGE_NO1   
            "ATT_FILE_NO_MK": item.find("ATT_FILE_NO_MK").text,     #IMAGE_NO2   
            "RCP_PARTS_DTLS": item.find("RCP_PARTS_DTLS").text,     #ingredient 재료
            
            # RCP_DETAIL
            # RCP_ORDER 순서
            "MANUAL01": item.find("MANUAL01").text,                 #DESCRIPTION 1
            "MANUAL_IMG01": item.find("MANUAL_IMG01").text,         #IMAGE_NO 1
            "MANUAL02": item.find("MANUAL02").text,                 #DESCRIPTION 2
            "MANUAL_IMG02": item.find("MANUAL_IMG02").text,         #IMAGE_NO 2
            "MANUAL03": item.find("MANUAL03").text,                 #DESCRIPTION 3
            "MANUAL_IMG03": item.find("MANUAL_IMG03").text,         #IMAGE_NO 3
            "MANUAL04": item.find("MANUAL04").text,                 #DESCRIPTION 4
            "MANUAL_IMG04": item.find("MANUAL_IMG04").text,         #IMAGE_NO 4
            "MANUAL05": item.find("MANUAL05").text,                 #DESCRIPTION 5
            "MANUAL_IMG05": item.find("MANUAL_IMG05").text,         #IMAGE_NO 5
            "MANUAL06": item.find("MANUAL06").text,                 #DESCRIPTION 6
            "MANUAL_IMG06": item.find("MANUAL_IMG06").text,         #IMAGE_NO 6
            "MANUAL07": item.find("MANUAL07").text,                 #DESCRIPTION 7
            "MANUAL_IMG07": item.find("MANUAL_IMG07").text,         #IMAGE_NO 7
            "MANUAL08": item.find("MANUAL08").text,                 #DESCRIPTION 8
            "MANUAL_IMG08": item.find("MANUAL_IMG08").text,         #IMAGE_NO 8
            "MANUAL09": item.find("MANUAL09").text,                 #DESCRIPTION 9
            "MANUAL_IMG09": item.find("MANUAL_IMG09").text,         #IMAGE_NO 9
            "MANUAL10": item.find("MANUAL10").text,                 #DESCRIPTION 10
            "MANUAL_IMG10": item.find("MANUAL_IMG10").text,         #IMAGE_NO 10
            "MANUAL11": item.find("MANUAL11").text,                 #DESCRIPTION 11
            "MANUAL_IMG11": item.find("MANUAL_IMG11").text,         #IMAGE_NO 11
            "MANUAL12": item.find("MANUAL12").text,                 #DESCRIPTION 12
            "MANUAL_IMG12": item.find("MANUAL_IMG12").text,         #IMAGE_NO 12
            "MANUAL13": item.find("MANUAL13").text,                 #DESCRIPTION 13
            "MANUAL_IMG13": item.find("MANUAL_IMG13").text,         #IMAGE_NO 13
            "MANUAL14": item.find("MANUAL14").text,                 #DESCRIPTION 14
            "MANUAL_IMG14": item.find("MANUAL_IMG14").text,         #IMAGE_NO 14
            "MANUAL15": item.find("MANUAL15").text,                 #DESCRIPTION 15
            "MANUAL_IMG15": item.find("MANUAL_IMG15").text,         #IMAGE_NO 15
            "MANUAL16": item.find("MANUAL16").text,                 #DESCRIPTION 16
            "MANUAL_IMG16": item.find("MANUAL_IMG16").text,         #IMAGE_NO 16
            "MANUAL17": item.find("MANUAL17").text,                 #DESCRIPTION 17
            "MANUAL_IMG17": item.find("MANUAL_IMG17").text,         #IMAGE_NO 17
            "MANUAL18": item.find("MANUAL18").text,                 #DESCRIPTION 18
            "MANUAL_IMG18": item.find("MANUAL_IMG18").text,         #IMAGE_NO 18
            "MANUAL19": item.find("MANUAL19").text,                 #DESCRIPTION 19
            "MANUAL_IMG19": item.find("MANUAL_IMG19").text,         #IMAGE_NO 19
            "MANUAL20": item.find("MANUAL20").text,                 #DESCRIPTION 20
            "MANUAL_IMG20": item.find("MANUAL_IMG20").text,         #IMAGE_NO 20
            
            #NUTRITION
            "INFO_ENG": item.find("INFO_ENG").text,                 #ENERGY
            "INFO_CAR": item.find("INFO_CAR").text,                 #CARB
            "INFO_PRO": item.find("INFO_PRO").text,                 #PROTEIN
            "INFO_FAT": item.find("INFO_FAT").text,                 #FAT
            "INFO_NA": item.find("INFO_NA").text,                   #SODIUM
            
        }
        data_list.append(data)
    df = pd.DataFrame(data_list)
    return df
idx = 1 # 시작
#가축질병발생정보 호출
soup = call_api(idx)
# 전체 데이터 개수
total_count = extract_total_count(soup)
print(f"Total Count: {total_count}")
# 가축질병발생정보 데이터프레임 생성
df = create_dataframe(soup)
df.head()
# 가축질병발생정보 전체 데이터를 데이터프레임으로 변환
all_data_frames = []
for idxs in range(1, 14):
    value = (idxs-1) * 100 + 1
    df = create_dataframe(call_api(value))
    all_data_frames.append(df)
df = pd.concat(all_data_frames, ignore_index=True)
df.to_csv("recipe.csv", index=False, encoding="utf-8-sig")
df.head()