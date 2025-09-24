import pandas as pd

# CSV 파일 읽기
df = pd.read_csv("C:/Users/user1/Documents/yoripick-joripick/RcpDetail.csv", sep='\t',encoding='utf-8')

# 결과 저장용 리스트
normalized_data = []

# 각 레시피 행마다 반복
for _, row in df.iterrows():
    rcp_seq = row['RCP_SEQ']  # 레시피 번호

    # 단계는 1~20까지 반복 (필요시 조정)
    for i in range(1, 21):
        desc_col = f'MANUAL{str(i).zfill(2)}'
        img_col = f'MANUAL_IMG{str(i).zfill(2)}'

        desc_val = row.get(desc_col)

        if pd.notna(desc_val) and str(desc_val).strip() != '':
            normalized_data.append({
                'RCP_NO': rcp_seq,
                'RCP_ORDER': i,
                'DESCRIPTION': str(desc_val).strip(),
                'IMAGE_NO': row.get(img_col) if pd.notna(row.get(img_col)) else ''
            })

# 정규화된 데이터프레임으로 변환
normalized_df = pd.DataFrame(normalized_data)

# 새 파일로 저장
normalized_df.to_csv("C:/Users/user1/Documents/yoripick-joripick/OffRcpDetail.xlsx", index=False, encoding='utf-8-sig')

print("✅ 변환 완료! 'OffRcpDetail.xlsx'로 저장되었습니다.")

