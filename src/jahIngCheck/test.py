import requests
import pandas as pd
from bs4 import BeautifulSoup

# 가축질병발생정보 호출
def call_api(idx):
    base_url = "http://apis.data.go.kr/1390803/AgriFood/FdCkry/getKoreanFoodFdCkryList?serviceKey="
    api_key = "01653a880ed500a6f9efa149676b3fc9a068a0c9ef2cc58a16c02b784b270b71"
    
    url1 = "&page_No="
    url2 = "&ckry_Name=조리&service_Type=xml&Page_Size=20"
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
    # total_count = int(soup.find("totalCnt").text)
    return 2

def create_dataframe(soup):
    data_list = []
    for item in soup.find_all("item"):
        data = {
            "ckry_Sumry_Info": item.find("ckry_Sumry_Info").text,
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


idx = 80 # 종료지점

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
for idxs in range(1, 2, 1):
    df = create_dataframe(call_api(idxs))
    all_data_frames.append(df)

df = pd.concat(all_data_frames, ignore_index=True)
df.to_csv("ing.csv", index=False, encoding="utf-8-sig")
df.head()

# print(soup.prettify())

# import requests
# import pandas as pd
# from bs4 import BeautifulSoup

# # 가축질병발생정보 호출
# def call_api(start_idx, end_idx):
#     api_key = "b73896e02699e132a57f62440dee3828019c0c2f146b333bbfddf4d0d23245aa"
#     base_url = "http://211.237.50.150:7080/openapi/"
#     api_url = "Grid_20150827000000000228_1"
#     url = (
#         f"{base_url}{api_key}/xml/{api_url}/{start_idx}/{end_idx}?"
#     )
#     response = requests.get(url)
#     xml_data = response.text
#     soup = BeautifulSoup(xml_data, 'xml')
    
#     return soup

# # 전체 데이터 개수 추출
# def extract_total_count(soup):
#     total_count = int(soup.find("totalCnt").text)
#     return total_count

# def create_dataframe(soup):
#     data_list = []
#     for item in soup.find_all("row"):
#         data = {
#             "ROW_NUM": item.find("ROW_NUM").text,
#             "RECIPE_ID": item.find("RECIPE_ID").text,
#             "COOKING_NO": item.find("COOKING_NO").text,
#             "COOKING_DC": item.find("COOKING_DC").text,
#             "STEP_TIP": item.find("STEP_TIP").text,
#             # "STRE_STEP_IMAGE_URL": item.find("STRE_STEP_IMAGE_URL").text,
            
#         }
#         data_list.append(data)
#     df = pd.DataFrame(data_list)
#     return df


# start_idx = 1 # 시작지점
# end_idx = 1000 # 종료지점

# #가축질병발생정보 호출
# soup = call_api(start_idx, end_idx)

# # 전체 데이터 개수
# total_count = extract_total_count(soup)
# print(f"Total Count: {total_count}")

# # 가축질병발생정보 데이터프레임 생성
# df = create_dataframe(soup)
# df.head()


# # 가축질병발생정보 전체 데이터를 데이터프레임으로 변환
# all_data_frames = []
# for idx in range(1, total_count + 1, end_idx):
#     df = create_dataframe(call_api(idx, idx + end_idx - 1))
#     all_data_frames.append(df)

# df = pd.concat(all_data_frames, ignore_index=True)
# df.to_csv("livestock_disease.csv", index=False, encoding="utf-8-sig")
# df.head()







