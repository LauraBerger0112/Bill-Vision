const Bill = require('../models/Bill');

// Obter todas as contas
exports.getBills = async (req, res) => {
    try {
        const bills = await Bill.find().sort({ date: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obter uma conta específica
exports.getBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Conta não encontrada' });
        }
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Criar uma nova conta
exports.createBill = async (req, res) => {
    const bill = new Bill({
        name: req.body.name,
        value: req.body.value,
        date: req.body.date,
        category: req.body.category
    });

    try {
        const newBill = await bill.save();
        res.status(201).json(newBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Atualizar uma conta
exports.updateBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Conta não encontrada' });
        }

        Object.assign(bill, req.body);
        const updatedBill = await bill.save();
        res.json(updatedBill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Deletar uma conta
exports.deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: 'Conta não encontrada' });
        }

        await bill.deleteOne();
        res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obter estatísticas
exports.getStats = async (req, res) => {
    try {
        const totalBills = await Bill.countDocuments();
        const pendingBills = await Bill.countDocuments({ paid: false });
        const totalPaid = await Bill.aggregate([
            { $match: { paid: true } },
            { $group: { _id: null, total: { $sum: '$value' } } }
        ]);

        res.json({
            totalBills,
            pendingBills,
            totalPaid: totalPaid[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 