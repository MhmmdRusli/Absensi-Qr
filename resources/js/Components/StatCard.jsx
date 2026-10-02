export default function StatCard({ label, value }) {
    return (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-sm text-[#6B7280]">{label}</p>
            <p className="text-2xl font-bold text-[#1F2937] mt-1">{value}</p>
        </div>
    );
}