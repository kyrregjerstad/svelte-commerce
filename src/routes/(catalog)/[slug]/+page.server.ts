import {
	fetchProductsOfCategory,
	fetchProductsOfCategoryTypesense
} from '$lib/services/ProductService'
import { currency, generatePriceRange } from '$lib/utils'
import { error } from '@sveltejs/kit'
export const prerender = false

export async function load({ url, params, locals, cookies, parent, setHeaders }) {
	const { store } = locals
	let loading = false,
		err,
		count,
		products,
		facets,
		ressss,
		pageSize,
		category

	const fl = {}
	const currentPage = +url.searchParams.get('page') || 1
	const sort = url.searchParams.get('sort')
	const searchData = url.searchParams.get('q')
	const query = url.searchParams
	const categorySlug = params.slug

	query.forEach(function (value, key) {
		fl[key] = value
	})

	let res
	try {
		loading = true
		res = await fetchProductsOfCategory({
			storeId: store?.id,
			query: query.toString(),
			categorySlug,
			server: true
		})
		products = res?.products
		count = res?.count
		facets = res?.facets
		pageSize = res?.pageSize
		category = res?.category
		err = res?.err
	} catch (e) {
		err = e
		throw error(400, e?.message || e || 'No results found')
	} finally {
		loading = false
	}
	let priceRange = []
	if (facets.all_aggs?.price_stats?.max && facets.all_aggs?.price_stats?.min) {
		priceRange = generatePriceRange(facets.all_aggs?.price_stats)
	}
	return {
		loading,
		err,
		currentPage,
		sort,
		products,
		count,
		facets,
		pageSize,
		query: query.toString(),
		searchData,
		fl,
		priceRange,
		ressss,
		category: category,
		store,
		categorySlug,
		origin: locals.origin
	}
}
