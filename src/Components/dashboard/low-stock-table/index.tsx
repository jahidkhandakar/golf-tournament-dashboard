import { ShoppingCart } from "lucide-react";

export default function LowStockTable({ products }: { products: any[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-red-600" />
                Recent Products
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 rounded-lg">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Product Name</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Purchase</th>
                            <th className="px-4 py-3">Selling</th>
                            <th className="px-4 py-3">Stock</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.length > 0 ? (
                            products.map((product: any) => (
                                <tr
                                    key={product._id}
                                    className="border-b border-b-slate-200 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-4 font-medium text-gray-900">
                                        {product.productName}
                                    </td>

                                    <td className="px-4 py-4 capitalize">
                                        {product.category}
                                    </td>

                                    <td className="px-4 py-4">
                                        ${product.purchasePrice}
                                    </td>

                                    <td className="px-4 py-4">
                                        ${product.sellingPrice}
                                    </td>

                                    <td
                                        className={`px-4 py-4 font-bold ${product.stockQuantity <= 10
                                            ? "text-red-600"
                                            : "text-green-600"
                                            }`}
                                    >
                                        {product.stockQuantity}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-6 text-center text-gray-500"
                                >
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}