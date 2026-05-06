"""Seed script to populate DB with realistic demo data (categories, menus, tables)."""

import asyncio
import sys
sys.path.insert(0, ".")

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import hash_password
from app.auth.models import Admin, Store
from app.menus.models import Category, Menu
from app.tables.models import TableEntity
from sqlalchemy import select, delete


CATEGORIES = [
    {"name": "추천 메뉴", "sort_order": 1},
    {"name": "정식/백반", "sort_order": 2},
    {"name": "찌개/탕", "sort_order": 3},
    {"name": "구이/볶음", "sort_order": 4},
    {"name": "면/밥", "sort_order": 5},
    {"name": "사이드", "sort_order": 6},
    {"name": "음료/주류", "sort_order": 7},
]

MENUS = [
    # 추천 메뉴 (cat 1)
    {"cat": 1, "name": "한우 불고기 정식", "price": 18000, "desc": "국내산 한우로 만든 달콤한 불고기와 계절 나물, 된장찌개가 함께 나오는 시그니처 정식", "img": "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=400&h=300&fit=crop", "order": 1},
    {"cat": 1, "name": "돼지갈비 구이", "price": 16000, "desc": "24시간 양념에 재운 돼지갈비를 숯불에 구워 육즙이 살아있는 인기 메뉴", "img": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop", "order": 2},
    {"cat": 1, "name": "해물 순두부찌개", "price": 11000, "desc": "신선한 해물과 부드러운 순두부가 어우러진 얼큰한 찌개. 밥 한 공기 뚝딱!", "img": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop", "order": 3},
    # 정식/백반 (cat 2)
    {"cat": 2, "name": "제육볶음 정식", "price": 12000, "desc": "매콤달콤 제육볶음에 밥, 국, 반찬 4종이 함께 나오는 든든한 한 끼", "img": "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=400&h=300&fit=crop", "order": 1},
    {"cat": 2, "name": "생선구이 정식", "price": 13000, "desc": "오늘의 생선을 소금구이로 바삭하게 구워낸 건강한 정식", "img": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop", "order": 2},
    {"cat": 2, "name": "두부 김치 정식", "price": 10000, "desc": "보글보글 끓인 김치와 고소한 두부, 따뜻한 밥이 어울리는 가성비 정식", "img": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop", "order": 3},
    {"cat": 2, "name": "비빔밥 정식", "price": 11000, "desc": "형형색색 나물과 고추장, 계란 프라이가 올라간 전통 비빔밥", "img": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=300&fit=crop", "order": 4},
    # 찌개/탕 (cat 3)
    {"cat": 3, "name": "김치찌개", "price": 9000, "desc": "묵은지와 돼지고기로 깊은 맛을 낸 얼큰한 김치찌개", "img": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop", "order": 1},
    {"cat": 3, "name": "된장찌개", "price": 9000, "desc": "직접 담근 된장으로 끓인 구수한 된장찌개. 두부와 호박이 듬뿍", "img": "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", "order": 2},
    {"cat": 3, "name": "부대찌개", "price": 12000, "desc": "햄, 소시지, 라면사리가 들어간 푸짐한 부대찌개 (2인 기준)", "img": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop", "order": 3},
    {"cat": 3, "name": "갈비탕", "price": 14000, "desc": "소갈비를 오랜 시간 고아 만든 진한 국물의 갈비탕", "img": "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", "order": 4},
    {"cat": 3, "name": "삼계탕", "price": 15000, "desc": "영계에 찹쌀, 인삼, 대추를 넣고 푹 고아낸 보양식", "img": "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?w=400&h=300&fit=crop", "order": 5},
    # 구이/볶음 (cat 4)
    {"cat": 4, "name": "삼겹살 구이", "price": 15000, "desc": "두툼하게 썬 국내산 삼겹살을 직화로 구워 드립니다 (200g)", "img": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop", "order": 1},
    {"cat": 4, "name": "오징어볶음", "price": 13000, "desc": "싱싱한 오징어를 매콤한 양념에 볶아낸 밥도둑 메뉴", "img": "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&h=300&fit=crop", "order": 2},
    {"cat": 4, "name": "닭갈비", "price": 14000, "desc": "춘천식 매콤 닭갈비. 떡, 고구마, 양배추와 함께 볶아 드립니다", "img": "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400&h=300&fit=crop", "order": 3},
    # 면/밥 (cat 5)
    {"cat": 5, "name": "잔치국수", "price": 7000, "desc": "멸치 육수에 소면을 말아낸 시원한 잔치국수", "img": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", "order": 1},
    {"cat": 5, "name": "볶음밥", "price": 8000, "desc": "김치와 계란이 들어간 고소한 김치볶음밥", "img": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", "order": 2},
    {"cat": 5, "name": "냉면", "price": 10000, "desc": "쫄깃한 면발과 시원한 육수의 물냉면 (여름 한정)", "img": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop", "order": 3, "sold_out": True},
    # 사이드 (cat 6)
    {"cat": 6, "name": "계란말이", "price": 5000, "desc": "부드럽고 촉촉한 수제 계란말이", "img": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop", "order": 1},
    {"cat": 6, "name": "김치전", "price": 7000, "desc": "바삭하게 부친 김치전. 막걸리 안주로 최고!", "img": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop", "order": 2},
    {"cat": 6, "name": "해물파전", "price": 12000, "desc": "새우, 오징어, 홍합이 듬뿍 들어간 바삭한 해물파전", "img": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop", "order": 3},
    {"cat": 6, "name": "떡볶이", "price": 6000, "desc": "쫄깃한 떡과 어묵이 들어간 매콤달콤 떡볶이", "img": "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400&h=300&fit=crop", "order": 4},
    {"cat": 6, "name": "모둠 튀김", "price": 8000, "desc": "새우, 고구마, 김말이 등 바삭한 모둠 튀김", "img": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop", "order": 5},
    # 음료/주류 (cat 7)
    {"cat": 7, "name": "콜라", "price": 2000, "desc": "시원한 코카콜라 (355ml)", "img": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop", "order": 1},
    {"cat": 7, "name": "사이다", "price": 2000, "desc": "톡 쏘는 칠성사이다 (355ml)", "img": "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=300&fit=crop", "order": 2},
    {"cat": 7, "name": "소주", "price": 5000, "desc": "참이슬 후레쉬 (360ml)", "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop", "order": 3},
    {"cat": 7, "name": "맥주", "price": 5000, "desc": "시원한 생맥주 (500ml)", "img": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop", "order": 4},
    {"cat": 7, "name": "막걸리", "price": 6000, "desc": "전통 방식으로 빚은 생막걸리 (750ml)", "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop", "order": 5},
    {"cat": 7, "name": "매실차", "price": 3000, "desc": "달콤새콤한 매실차 (따뜻하게/차갑게 선택 가능)", "img": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop", "order": 6},
]


async def seed_full():
    """Populate DB with categories, menus, and tables."""
    async with AsyncSessionLocal() as db:
        # Get store
        result = await db.execute(select(Store).where(Store.store_code == "demo-store"))
        store = result.scalar_one_or_none()
        if not store:
            print("❌ Store not found. Run `python scripts/seed.py` first.")
            return

        store_id = store.id

        # Clear existing menus and categories
        await db.execute(delete(Menu))
        await db.execute(delete(Category))
        await db.execute(delete(TableEntity))
        await db.flush()

        # Insert categories
        cat_ids = {}
        for cat_data in CATEGORIES:
            cat = Category(store_id=store_id, name=cat_data["name"], sort_order=cat_data["sort_order"])
            db.add(cat)
            await db.flush()
            cat_ids[cat_data["sort_order"]] = cat.id

        # Insert menus
        for menu_data in MENUS:
            menu = Menu(
                category_id=cat_ids[menu_data["cat"]],
                name=menu_data["name"],
                price=menu_data["price"],
                description=menu_data["desc"],
                image_url=menu_data["img"],
                sort_order=menu_data["order"],
                is_sold_out=menu_data.get("sold_out", False),
            )
            db.add(menu)

        # Insert 6 tables (password: 1234)
        table_password = hash_password("1234")
        for i in range(1, 7):
            table = TableEntity(
                store_id=store_id,
                table_number=i,
                password_hash=table_password,
            )
            db.add(table)

        await db.commit()

        print(f"✅ {len(CATEGORIES)}개 카테고리 생성")
        print(f"✅ {len(MENUS)}개 메뉴 생성 (이미지 URL 포함)")
        print(f"✅ 6개 테이블 생성 (비밀번호: 1234)")
        print("Done!")


if __name__ == "__main__":
    asyncio.run(seed_full())
