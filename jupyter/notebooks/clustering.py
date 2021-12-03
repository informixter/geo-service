#!/usr/bin/env python
# coding: utf-8

import sqlalchemy as sa
import os
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
import geopandas as gp
from shapely.geometry import Point
# from haversine import haversine, Unit
from sklearn.feature_extraction.text import TfidfVectorizer
from flask import Flask, request, jsonify

app = Flask(__name__)

engine = sa.create_engine(os.environ['db'])


def calc(n_clusters, id):
    search_df = pd.read_sql("select id, name,data from routes where id = '{}';".format(id), engine)
    df_sql = pd.read_sql("select id, name,data from routes;", engine)
    coords = []
    for i, row in df_sql.iterrows():
        for p in row['data']['points']:
            coords.append({"lat": p['coords']['latitude'], "lon": p['coords']['longitude']})

    if len(coords) < n_clusters:
        n_clusters = len(coords)

    df = pd.DataFrame(coords, columns=['lon', 'lat'])
    geometry = [Point(xy) for xy in zip(df.lon, df.lat)]

    gdf = gp.GeoDataFrame(df, geometry=geometry)

    a = pd.Series(gdf['geometry'].apply(lambda p: p.x))
    b = pd.Series(gdf['geometry'].apply(lambda p: p.y))
    X = np.column_stack((a, b))

    kmeans = KMeans(n_clusters=n_clusters, init='k-means++', random_state=5, max_iter=400)
    y_kmeans = kmeans.fit_predict(X)
    k = pd.DataFrame(y_kmeans, columns=['cluster'])
    gdf = gdf.join(k)

    # user_coord = [55.94745399, 54.72614154]
    # pr = kmeans.predict([user_coord])
    # get_claster_center = kmeans.cluster_centers_[pr[0]]
    #
    #
    # user = (user_coord[1], user_coord[0])  # (lat, lon)
    # center_k = (get_claster_center[1], get_claster_center[0])
    # meters = haversine(center_k, user, Unit.METERS)

    # метод получения номера кластера
    def get_cluster_number(user_coord, kmeans):
        pr = kmeans.predict([user_coord])
        return pr[0]

    #
    # потестим
    # get_cluster_number(user_coord, kmeans)
    def get_codes(df, kmeans):
        res = []
        train = []
        for i, row in df.iterrows():  # проходим по всем маршрутам
            cls = []
            for p in row['data']['points']:  # проходим по всем точкам в маршруте
                coord_u = [p['coords']['longitude'], p['coords']['latitude']]
                cl_n = get_cluster_number(coord_u, kmeans)  # получаем номер кластера
                cls.append(int(cl_n))
            # сохранем только переходы
            valid_in_array = []
            start_point = cls[0]
            z = 0
            for i, cluster_number in enumerate(cls):
                if i == 0:
                    valid_in_array.append(str(cluster_number))
                    z += 1
                    continue
                if start_point == cluster_number:
                    continue
                valid_in_array.append(str(cluster_number))
                z += 1
                start_point = cluster_number
                w = "".join(valid_in_array)  # кодируем маршрут в виде последовательностей
            train.append(w)
            res.append({"name": row['name'], "route_code": w, 'id': row['id']})
        return res, train

    res, train_for_tfidf = get_codes(df_sql, kmeans)
    tfidfvectorizer = TfidfVectorizer(analyzer='char')
    tfidf_wm = tfidfvectorizer.fit(train_for_tfidf)

    search2 = get_codes(search_df, kmeans)[1][0]
    results = []
    for r in res:
        if search_df['id'].values[0] == r['id']:
            continue
        s1 = tfidf_wm.transform([r['route_code']]).todense()  # получаем вектор маршрута
        s2 = tfidf_wm.transform([search2]).todense()  # получаем искомого маршрута
        score = cosine_similarity(np.asarray(s1), np.asarray(s2))  # Косинусное сходство
        results.append({"name": r['name'], "score": score[0][0], "route_code": r['route_code'], 'id': r['id']})

    return sorted(results, key=lambda d: d['score'], reverse=True)


print(calc(15, 3123123122131232300))


@app.route("/")
def get_calc():
    id = request.args.get('id', default=0, type=int)
    n_cl = request.args.get('n_cl', default=15, type=int)
    return jsonify(calc(n_cl, id))


@app.route("/similar_coords")
def similar_coords():
    id = request.args.get('id', default=0, type=int)
    n_cl = request.args.get('n_cl', default=15, type=int)
    return jsonify(calc(n_cl, id))


@app.route("/centers")
def centers():
    n_clusters = request.args.get('n_cl', default=15, type=int)
    df_sql = pd.read_sql("select id, name,data from routes;", engine)
    coords = []
    for i, row in df_sql.iterrows():
        for p in row['data']['points']:
            coords.append({"lat": p['coords']['latitude'], "lon": p['coords']['longitude']})

    if len(coords) < n_clusters:
        n_clusters = len(coords)

    df = pd.DataFrame(coords, columns=['lon', 'lat'])
    geometry = [Point(xy) for xy in zip(df.lon, df.lat)]

    gdf = gp.GeoDataFrame(df, geometry=geometry)

    a = pd.Series(gdf['geometry'].apply(lambda p: p.x))
    b = pd.Series(gdf['geometry'].apply(lambda p: p.y))
    X = np.column_stack((a, b))

    kmeans = KMeans(n_clusters=n_clusters, init='k-means++', random_state=5, max_iter=400)
    y_kmeans = kmeans.fit_predict(X)
    k = pd.DataFrame(y_kmeans, columns=['cluster'])
    gdf = gdf.join(k)
    ret = []
    for i, row in enumerate(kmeans.cluster_centers_):
        ret.append({"lat": row[1], "lon": row[0], "number": i})

    return jsonify(ret)
