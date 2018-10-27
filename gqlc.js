let _gqlcOpt = {
    "url": "",
    "method": "post",
    "credentials": "include"
};
class GraphQLClient {
    static Init(config) {
        _gqlcOpt = Object.assign(_gqlcOpt, config);
    }
    static async Get(q) {
        const bq = GraphQLClient.Build(q);
        return await GraphQLClient.Send(JSON.stringify({
            query: `query ${bq}`
        }));
    }
    static async Set(q) {
        const bq = GraphQLClient.Build(q);
        return await GraphQLClient.Send(JSON.stringify({
            query: `mutation ${bq}`
        }));
    }

    static Build() {
        let result = "{ ";
        for (let i = 0; i < arguments.length; i++)
            result += GraphQLClient.BuildObject(arguments[i]);
        result += " }";
        return result;
    }
    static BuildObject(obj) {
        let result = ``;
        if (!obj)
            return result;
        if (typeof (obj) === "string" || typeof (obj) === "number")
            return JSON.stringify(obj);
        Object.keys(obj).forEach((k) => {
            result += k + " ";
            const vals = obj[k];
            const arg = vals.find((element, index, array) => {
                if (!element || typeof element !== "object" || !element._args)
                    return false;
                return true;
            });
            let acount = 0;
            if (arg) {
                acount = 1;
                result += " ( ";
                Object.keys(arg._args).forEach((k) => {
                    result += k + ":";
                    const vals = arg._args[k];
                    if (vals instanceof Array) {
                        if (vals.length === 0)
                            result += "[],";
                        else {
                            const v = vals[0];
                            if (typeof (v) === "string")
                                result += JSON.stringify(vals) + ",";
                            else if (typeof (v) === "number")
                                result += "[" + vals.join(',') + "],";
                            else {
                                result += "[";
                                vals.forEach((el) => {
                                    result += "{";
                                    Object.keys(el).forEach((kl) => {
                                        result += kl + ":" + GraphQLClient.BuildObject(el[kl]) + ",";
                                    });
                                    result = result.slice(0, -1) + "},";
                                });
                                result = result.slice(0, -1) + "],";
                            }
                        }
                    } else
                        result += JSON.stringify(vals) + ",";
                });
                result = result.slice(0, -1) + " ) ";
                const ind = vals.indexOf(arg);
                vals.splice(ind, 1);
            }
            result += vals.length > acount ? " { " : "";
            for (let i = 0; i < vals.length; i++) {
                const o = vals[i];
                if (!o)
                    continue;
                if (typeof (o) === "string") {
                    result += o + " ";
                } else if (o instanceof Array) {
                    result += o.join(' ');
                } else
                    result += GraphQLClient.BuildObject(o);
            }
            result += vals.length > acount ? " } " : "";
        });
        return result;
    }

    static async Send(data) {
        try {
            const resp = await fetch(_gqlcOpt.url, {
                method: _gqlcOpt.method,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: data,
                credentials: _gqlcOpt.credentials
            });
            return await resp.json();
        } catch (e) {
            return { "error": e };
        }
    }
}