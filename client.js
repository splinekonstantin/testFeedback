const { axios } = require('./fakeBackend/mock');

const getFeedbackByProductViewData = async (product, actualize = false) => {
        function handleErrorFeedback(err) {
                if (err.response.status === 404) {
                        console.log('Такого продукта не существует');
                        throw new Error('Такого продукта не существует');
                }
                if (err.response.status === 400) {
                        console.log('Идентификатор продукта не указан');
                        throw new Error('Идентификатор продукта не указан');
                }
        }
        function handleErrorUsers(err) {
                if (err.response.status === 400) {
                        console.log('Идентифиактор пользователя не указан');
                        throw new Error('Идентифиактор пользователя не указан');
                }
        }
        // запрашиваем дату об отзывах, сразу пытаемся поймать ошибку
        const feedbackRes = await axios
                .get('./fakeBackend/feedbacks.js', {
                        params: {
                                product,
                        },
                })
                .catch(handleErrorFeedback);

        const feedbacksArrUnsorted = feedbackRes.data.feedback;

        // случай, когда отзывов нет
        if (feedbacksArrUnsorted.length === 0) {
                console.log('Отзывов нет');
                return {
                        message: 'Отзывов пока нет',
                };
        }

        const usersIds = feedbacksArrUnsorted.map(singleFeedback => singleFeedback.userId);

        // запрашиваем дату о юзерах, сразу пытаемся поймать ошибку
        const usersRes = await axios
                .get('./fakeBackend/users', {
                        params: {
                                ids: usersIds,
                        },
                })
                .catch(handleErrorUsers);

        const usersArr = usersRes.data.users;

        // ютилити функция для поиска юзера по id
        function findById(id) {
                return function(user) {
                        return user.id === id;
                };
        }

        // сортируем массив с отзывами по датам
        const feedbacksArr = feedbacksArrUnsorted.sort((a, b) => a.date - b.date);

        // формируем окончательный массив с отзывами
        const feedback = feedbacksArr.map(function(singleFeedback) {
                const user = usersArr.find(findById(singleFeedback.userId));
                // форматируем дату
                const date = new Date(singleFeedback.date);
                const dateTimeFormat = new Intl.DateTimeFormat('en', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                });
                const [{ value: month }, , { value: day }, , { value: year }] = dateTimeFormat.formatToParts(date);
                return {
                        user: `${user.name} (${user.email})`,
                        message: `${singleFeedback.message}`,
                        date: `${year}-${month}-${day}`,
                };
        });
        console.log(feedback);
        return { feedback };
};

getFeedbackByProductViewData('elba');

module.exports = { getFeedbackByProductViewData };
