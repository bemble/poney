import store from "../store";

class Api {
    static database(path, options = {}, queryParams = null) {
        return Api.fetch(`/database${path}`, options, queryParams);
    }

    static search(model, query, queryParams = null) {
        return Api.database(`/search/${model}`, {method: "POST", body: query}, queryParams);
    }

    static list(model, queryParams = null) {
        return Api.database(`/${model}`, null, queryParams);
    }

    static get(model, id, queryParams = null) {
        return Api.database(`/${model}/${id}`, null, queryParams);
    }

    static addOrUpdate(model, id, values, queryParams = null) {
        if (!id || id < 0) {
            return Api.add(model, values, queryParams);
        }
        return Api.get(model, id).then(dbModel => {
            if (model === "configuration" && (!dbModel || dbModel.isDefaultValue)) {
                values.id = id;
                dbModel = null;
            }
            return dbModel ? Api.update(model, id, values, queryParams) : Api.add(model, values, queryParams);
        });
    }

    static add(model, values, queryParams = null) {
        return Api.database(`/${model}`, {method: 'POST', body: values}, queryParams);
    }

    static update(model, id, values, queryParams = null) {
        return Api.database(`/${model}/${id}`, {method: 'PATCH', body: values}, queryParams);
    }

    static delete(model, id, queryParams = null) {
        return Api.database(`/${model}/${id}`, {method: 'DELETE'}, queryParams);
    }

    static service(serviceName, options, queryParams = null) {
        return Api.fetch(`/service/${serviceName}`, options, queryParams);
    }

    static public(serviceName, options, queryParams = null) {
        return Api.fetch(`/public/${serviceName}`, options, queryParams);
    }

    static fetch(path, options = null, queryParams = null) {
        if (!options) {
            options = {};
        }
        if (!options.headers) {
            options.headers = {};
        }

        if (options.body) {
            options.headers["Accept"] = 'application/json';
            options.headers["Content-Type"] = 'application/json';
            options.body = JSON.stringify(options.body);
        }

        if (!path.startsWith("/public") && !options.headers.Authorization) {
            options.headers["Authorization"] = `Bearer ${store.getState().app.token}`;
        }

        let basePath = process.env.PUBLIC_URL;
        if (basePath === "/") {
            basePath = "";
        }
        basePath += "/api";

        let params = "";
        if (queryParams) {
            params = `?${(new URLSearchParams(queryParams)).toString()}`
        }
        return fetch(`${basePath}${path}${params}`, options).then(res => options.method !== "DELETE" ? res.json() : res);
    }
}

export default Api;