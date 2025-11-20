package com.skillsync.feedback.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String FEEDBACK_EXCHANGE = "feedback.exchange";
    public static final String FEEDBACK_QUEUE = "feedback.queue";
    public static final String FEEDBACK_ROUTING_KEY = "feedback.#";

    @Bean
    public TopicExchange feedbackExchange() {
        return new TopicExchange(FEEDBACK_EXCHANGE);
    }

    @Bean
    public Queue feedbackQueue() {
        return QueueBuilder.durable(FEEDBACK_QUEUE)
                .withArgument("x-dead-letter-exchange", "feedback.dlx")
                .build();
    }

    @Bean
    public Binding feedbackBinding(Queue feedbackQueue, TopicExchange feedbackExchange) {
        return BindingBuilder.bind(feedbackQueue)
                .to(feedbackExchange)
                .with(FEEDBACK_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setConcurrentConsumers(3);
        factory.setMaxConcurrentConsumers(10);
        return factory;
    }
}
