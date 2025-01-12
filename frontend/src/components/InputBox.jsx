
export const InputBox=({label,placeholder,onChange})=>
{
    return <div>
        <div className="text-sm font-medium text-left py-2 text-[#193e76]">
            {label}
        </div>
        <input onChange={onChange} placeholder={placeholder} className="w-full px-2 py-1 border-gray-300 rounded-md">
        </input>
    </div>
}