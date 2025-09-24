import pandas as pd
import cx_Oracle


# === 안전한 정수 변환 함수 (이 부분을 추가하세요) ===
def to_int_or_none(value):
    if pd.isna(value):
        return None  # 빈 값은 DB에 NULL로 들어가도록 None 반환
    try:
        return int(value)
    except (ValueError, TypeError):
        return None # 숫자로 변환할 수 없는 값도 None 처리

# === 엑셀 파일 경로 ===
excel_file = 'C:/Users/user1/Documents/yoripick-joripick/RECIPE_API.xlsx'

# === Oracle DB 연결 ===
dsn = cx_Oracle.makedsn("43.203.167.95", 1521, sid="xe")
conn = cx_Oracle.connect(user="C##POWERPUFFGIRLS", password="POWERPUFFGIRLS", dsn=dsn)
cursor = conn.cursor()

# === 시트 읽기 ===
df_recipe = pd.read_excel(excel_file, sheet_name='RECIPE')
df_nutrient = pd.read_excel(excel_file, sheet_name='NUTRIENT')
df_detail = pd.read_excel(excel_file, sheet_name='RCP_DETAIL')
df_ings = pd.read_excel(excel_file, sheet_name='RCP_INGS')

# === Helper: get next val from sequence ===
def get_seq_val(seq_name):
    cursor.execute(f"SELECT {seq_name}.NEXTVAL FROM dual")
    return cursor.fetchone()[0]

# === IMAGE 테이블: IMAGE_NO는 시퀀스로 생성, ORIGIN_NAME 기준으로 중복 제거 ===
image_map = {}
unique_images = pd.concat([
    df_recipe[['SERVER_NAME', 'ORIGIN_NAME']],
    df_detail[['SERVER_NAME', 'ORIGIN_NAME']]
]).dropna().drop_duplicates(subset=['ORIGIN_NAME', 'SERVER_NAME']) 

for _, row in unique_images.iterrows():
    origin_name = row['ORIGIN_NAME']
    server_name = row['SERVER_NAME']

    if origin_name not in image_map:
        new_image_no = get_seq_val('SEQ_IMAGE_NO')

        cursor.execute("""
            INSERT INTO IMAGE (IMAGE_NO, ORIGIN_NAME, SERVER_NAME)
            VALUES (:1, :2, :3)
        """, (new_image_no, origin_name, server_name))

        image_map[origin_name] = new_image_no

# === NUTRIENT 테이블 ===
nutrient_map = {}
for _, row in df_nutrient.iterrows():
    new_nutrient_no = get_seq_val('SEQ_NUTRIENT_NO')
    cursor.execute("""
        INSERT INTO NUTRIENT (NUTRIENT_NO, ENERGY, CARB, PROTEIN, FAT, SODIUM)
        VALUES (:1, :2, :3, :4, :5, :6)
    """, (new_nutrient_no, int(row['ENERGY']), int(row['CARB']), int(row['PROTEIN']), int(row['FAT']), int(row['SODIUM'])))
    nutrient_map[row['NUTRIENT_NO']] = new_nutrient_no

# === RECIPE 테이블 ===
recipe_map = {}
for index, row in df_recipe.iterrows():
    try:
        new_rcp_no = get_seq_val('SEQ_RECIPE_NO')
        
        # 맵에서 값 조회
        image_no = image_map.get(row['ORIGIN_NAME'], None)
        nutrient_no = nutrient_map.get(row['NUTRIENT_NO'], None)
        
        # 변수 정리
        approval = str(row['APPROVAL']).strip()[:1] if pd.notnull(row['APPROVAL']) else None
        tag_value = row['TAG'] if pd.notna(row['TAG']) else None # TAG의 NaN을 None으로 변경
        delete_status = row['DELETE_STATUS']
        if pd.isna(delete_status) or str(delete_status).strip() == '':
            delete_status = 'N'

        # ❗❗❗ 디버깅을 위해 이 부분을 추가하세요 ❗❗❗
        # ----------------------------------------------------
        final_values = (
            new_rcp_no,
            row['RCP_NAME'],
            to_int_or_none(row['RCP_MTH_NO']),
            to_int_or_none(row['RCP_STA_NO']),
            tag_value,
            nutrient_no,
            approval,
            image_no,
            delete_status
        )
        print(f"--- 엑셀 행: {index + 2}, 최종 전달 값 ---")
        print(final_values)
        print("-" * 20)
        # ----------------------------------------------------
        
        cursor.execute("""
            INSERT INTO RECIPE (RCP_NO, RCP_NAME, RCP_MTH_NO, RCP_STA_NO, TAG, NUTRIENT_NO, APPROVAL, IMAGE_NO, DELETE_STATUS)
            VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9)
        """, final_values) # 변수로 전달

        recipe_map[row['RCP_NO']] = new_rcp_no
        
    except cx_Oracle.DatabaseError as e:
        print(f"--- ‼️ 데이터베이스 오류 발생 ---")
        print(f"오류가 발생한 엑셀 행: {index + 2}")
        print(f"오류 데이터: \n{row}")
        raise e

# === RCP_DETAIL 테이블 ===
for _, row in df_detail.iterrows():
    rcp_no = recipe_map.get(row['RCP_NO'])
    image_no = image_map.get(row['ORIGIN_NAME'], None)
    cursor.execute("""
        INSERT INTO RCP_DETAIL (RCP_NO, RCP_ORDER, DESCRIPTION, IMAGE_NO)
        VALUES (:1, :2, :3, :4)
    """, (rcp_no, int(row['RCP_ORDER']), row['DESCRIPTION'], image_no))

# === RCP_INGS 테이블 ===
for _, row in df_ings.iterrows():
    rcp_no = recipe_map.get(row['RCP_NO'])
    cursor.execute("""
        INSERT INTO RCP_INGS (RCP_NO, RCP_ING_LIST)
        VALUES (:1, :2)
    """, (rcp_no, row['RCP_ING_LIST']))

# === 커밋 및 종료 ===
conn.commit()
cursor.close()
conn.close()

print("데이터 이관 완료 ✅")


# try:
#     dsn = cx_Oracle.makedsn("43.203.167.95", 1521, sid="xe")
#     conn = cx_Oracle.connect(user="C##POWERPUFFGIRLS", password="POWERPUFFGIRLS", dsn=dsn)
#     print("✅ Oracle 연결 성공")
#     conn.close()
# except cx_Oracle.DatabaseError as e:
#     error, = e.args
#     print("❌ Oracle 연결 실패")
#     print(f"오류 코드: {error.code}")
#     print(f"오류 메시지: {error.message}")