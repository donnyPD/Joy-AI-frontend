import { Info } from 'lucide-react'

export default function InventoryDefaultValues() {

  return (
    <div className="space-y-6">
      {/* Heading Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Default Values</h2>
            <p className="text-sm text-gray-600">
              Learn about the usage and purpose of the Inventory, Ideal Inventory, and To Be Ordered fields.
            </p>
          </div>
        </div>
      </div>

      {/* Field Descriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-8">
          {/* Inventory Field */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E91E63]"></span>
              Inventory
            </h3>
            <div className="pl-4 border-l-2 border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                The <strong>Inventory</strong> field represents the current quantity of an item that you have in stock. 
                This is the actual count of items available at any given time. It is updated when items are purchased, 
                used, or when inventory adjustments are made. This value helps you track your current stock levels and 
                identify when items need to be reordered.
              </p>
            </div>
          </div>

          {/* Ideal Inventory Field */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E91E63]"></span>
              Ideal Inventory
            </h3>
            <div className="pl-4 border-l-2 border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                The <strong>Ideal Inventory</strong> field represents the target or optimal quantity of an item that 
                you want to maintain in stock. This is the ideal stock level that ensures you have enough inventory 
                to meet demand without overstocking. When creating new inventory items, a default ideal inventory value 
                can be set to help maintain consistent stock levels. The system uses this value to calculate how many 
                items need to be ordered.
              </p>
            </div>
          </div>

          {/* To Be Ordered Field */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E91E63]"></span>
              To Be Ordered
            </h3>
            <div className="pl-4 border-l-2 border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                The <strong>To Be Ordered</strong> field is automatically calculated as the difference between your 
                Ideal Inventory and your current Inventory (Ideal Inventory - Inventory). This value indicates how 
                many units of an item you need to order to reach your ideal stock level. If the value is positive, 
                it means you need to order that quantity. If it's negative or zero, it means you have sufficient or 
                excess inventory. This field helps streamline your purchasing process by clearly showing what needs 
                to be reordered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
