import Sortable from 'sortablejs';

document.addEventListener('livewire:initialized', () => {
    const containers = document.querySelectorAll('[wire\\:sortable\\.item]');
    
    containers.forEach(container => {
        new Sortable(container, {
            group: 'tasks',
            animation: 150,
            onEnd: function(evt) {
                const taskId = evt.item.getAttribute('wire:sortable.item');
                const newStatus = evt.to.getAttribute('wire:sortable.item');
                
                Livewire.dispatch('task-status-updated', {
                    taskId: taskId,
                    newStatus: newStatus
                });
            }
        });
    });
}); 