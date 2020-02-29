let _gqlcOpt = {
	"method": "post",
	"credentials": "include"
}
export default class GraphQLClient{
	static Init(config) {
		_gqlcOpt = Object.assign(_gqlcOpt, config)
		return GraphQLClient
	}
	static async Get(q,info,field) {
		const bq = GraphQLClient.Build(q)
		const result = await GraphQLClient.Send(JSON.stringify({
			query: `query ${bq}`
		}))
		return Object.assign(info || {},(field?result[field]:result))
	}
	static async Set(q,info,field) {
		const bq = GraphQLClient.Build(q)
		const result = await GraphQLClient.Send(JSON.stringify({
			query: `mutation ${bq}`
		}))
		return Object.assign(info || {},(field?result[field]:result))
	}

	static Build() {
		let result = "{ "
		for (let i = 0; i < arguments.length; i++)
			result += GraphQLClient.BuildObject(arguments[i])
		result += " }"
		return result
	}
	static BuildObject(obj) {
		let result = ``
		if (!obj)
			return result
		if (typeof (obj) === "string" || typeof (obj) === "number")
			return JSON.stringify(obj)
		Object.keys(obj).forEach((k) => {
			result += k + " "
			const values = obj[k]
			const arg = values.find((element, index, array) => {
				if (!element || typeof element !== "object" || !element.$args)
					return false
				return true
			})		
			let acount = 0
			if (arg) {
				result+=GraphQLClient.BuildArgs(arg.$args)
				const ind = values.indexOf(arg)
				values.splice(ind, 1)
			}
			result += values.length > acount ? " { " : ""
			for (let i = 0; i < values.length; i++) {
				const o = values[i]
				if (!o)
					continue
				if (typeof (o) === "string") {
					result += o + " "
				} else if (o instanceof Array) {
					result += o.join(' ')
				} else
					result += GraphQLClient.BuildObject(o)
			}
			result += values.length > acount ? " } " : ""
		})
		return result
	}

	static BuildArgs(args){
		let result = " ( "
		Object.keys(args).forEach((k) => {
			result += k + ":"
			const vals = args[k]
			if (vals instanceof Array) {
				if (vals.length === 0)
					result += "[],"
				else {
					const v = vals[0]
					if (typeof (v) === "string")
						result += JSON.stringify(vals) + ","
					else if (typeof (v) === "number")
						result += "[" + vals.join(',') + "],"
					else {
						result += "["
						vals.forEach((el) => {
							result += "{"
							Object.keys(el).forEach((kl) => {
								result += kl + ":" + GraphQLClient.BuildObject(el[kl]) + ","
							})
							result = result.slice(0, -1) + "},"
						})
						result = result.slice(0, -1) + "],"
					}
				}
			} else
				result += JSON.stringify(vals) + ","
		})
		return result.slice(0, -1) + " ) "
	}

	static async Send(data) {
		const resp = await fetch(_gqlcOpt.url, {
			method: _gqlcOpt.method,
			headers: Object.assign({
				"Content-Type": "application/json",
				"Accept": "application/json"
			},_gqlcOpt.headers || {}),
			body: data,
			credentials: _gqlcOpt.credentials
		})
		const result =  await resp.json()
		return result.data
	}
}
